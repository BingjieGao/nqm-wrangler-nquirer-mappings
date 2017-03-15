module.exports = (function() {
  /**
   * This module generates the ratio in each yearGroup from one LSOA taught in each school to the total pupil in each demographic from that LSOA
   */
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");

  const writeToFile = function(dataArray, destStream, output) {
    return Promise.all(_.map(dataArray, (data) => {
      output.debug(JSON.stringify(data));
      return destStream.write(`${JSON.stringify(data)}\n`);
    }))
    .then((result) => {
      return {result};
    })
    .catch((err) => {
      output.debug("write to file error %s", err);
    });
  };

  const Wrangler = function(input, output, destStream, mappingString) {
    this.output = output;
    this.input = input;
    this.destStream = destStream;
    this.count = 0;
    this.dataObj = {};
  };

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    saveObjects(jsonObj, this.dataObj);
    this.count += 1;
  };

  Wrangler.prototype.finish = function() {
    const dataArray = [];
    _.forEach(this.dataObj, (areaObj, areaId) => {
      _.forEach(areaObj, (genderObj, gender) => {
        _.forEach(genderObj, (ratioObj, NCYear) => {
          _.forEach(ratioObj["ratio"], (ratio, schoolId) => {
            ratioObj["ratio"][schoolId] = ratio / ratioObj["total"];
          });
          const rObj = {
            areaId: areaId,
            gender: gender,
            NCYear: NCYear,
            ratio: ratioObj["ratio"],
          };
          dataArray.push(rObj);
        });
      });
    });
    writeToFile(dataArray, this.destStream, this.output)
      .then(() => {
        this.destStream.end();
      })
      .catch((err) => {
        this.output.debug(`error caught ${err.message}`);
      });
  };

  function saveObjects(jsonObj, dataObj) {
    const areaId = jsonObj["LLSOA_AUT13"];
    const gender = jsonObj["Gender_AUT13"] == "F" ? "female" : "male";
    const NCYear = jsonObj["NCyearActual_AUT13"];
    const schoolId = jsonObj["Estab_AUT13"];
    if (!dataObj[areaId]) {
      dataObj[areaId] = {};
    }
    if (!dataObj[areaId][gender]) {
      dataObj[areaId][gender] = {};
    }
    if (!dataObj[areaId][gender][NCYear]) {
      dataObj[areaId][gender][NCYear] = {};
      dataObj[areaId][gender][NCYear] = {
        "ratio": {},
        "total": 0,
      };
    }
    dataObj[areaId][gender][NCYear]["total"] += 1;
    if (!dataObj[areaId][gender][NCYear]["ratio"][schoolId]) {
      dataObj[areaId][gender][NCYear]["ratio"][schoolId] = 0;
    }
    dataObj[areaId][gender][NCYear]["ratio"][schoolId] += 1;
  }

  return Wrangler;
}());
