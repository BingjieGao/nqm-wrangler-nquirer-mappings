module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");

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
    return new Promise((resolve, reject) => {
      reFormatData(this.dataObj, this.destStream)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
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
      };
    }
    if (!dataObj[areaId][gender][NCYear]["ratio"][schoolId]) {
      dataObj[areaId][gender][NCYear]["ratio"][schoolId] = 1;
    }
    if (dataObj[areaId][gender][NCYear]["ratio"][schoolId]) {
      dataObj[areaId][gender][NCYear]["ratio"][schoolId] += 1;
    }
  }

  function reFormatData(dataObj, destStream) {
    return Promise.all(_.map(dataObj, (areaObj, areaId) => {
      return Promise.all(_.map(areaObj, (genderObj, gender) => {
        return Promise.all(_.map(genderObj, (ratioObj, NCYear) => {
          const rObj = {
            areaId: areaId,
            gender: gender,
            NCYear: NCYear,
            ratio: ratioObj["ratio"],
          };
          return destStream.write(`${JSON.stringify(rObj)}\n`);
        }));
      }));
    }));
  }

  return Wrangler;
}());
