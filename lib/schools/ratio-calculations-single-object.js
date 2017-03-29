module.exports = (function() {
  /**
   * generates the ratio for each school, the output schema is:
   * @param dataObj - saved dic for all data
   * each element should describe the ratio of pupils from one LSOA registered in different schools
   * 
   * dataObj[areaId][gender][yearGroup][ratio] = {}
   * each ratio object contains {schoolId: ratio}
   */
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");

  const writeToFile = function(dataArray, destStream, output) {
    // write saved dataArray line by line to file
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
    // dataObj - saved dic for all data
    this.dataObj = {};
  };

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    saveObjects(jsonObj, this.dataObj);
  };

  Wrangler.prototype.finish = function() {
    const dataArray = [];
    // reformat all the data read from raw csv file
    // iterating whold data object saved
    _.forEach(this.dataObj, (areaObj, areaId) => {
      // iterating each area code
      _.forEach(areaObj, (genderObj, gender) => {
        // for each gender
        _.forEach(genderObj, (ratioObj, NCYear) => {
          // iterating each yearGroup, N1, N2, R, 1, 2, ..., 13
          _.forEach(ratioObj["ratio"], (ratio, schoolId) => {
            // assign ratioObj with schoolId: ratio
            // instead of making ratio for each schoolId as one whole object
            // but each schoolId would make a single object with it's own ratio accordingly with areaIds
            ratioObj["ratio"][schoolId] = ratio / ratioObj["total"];
            const rObj = {
              areaId: areaId,
              gender: gender,
              yearGroup: NCYear,
              schoolId: schoolId,
              ratio: ratioObj["ratio"][schoolId],
            };
            dataArray.push(rObj);
          });
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

  // dataObj - saved dic for all data
  function saveObjects(jsonObj, dataObj) {
    const areaId = jsonObj["LLSOA_AUT13"];
    // check if areaId is actaully a LSOA11CD code, which contains E
    if (areaId !== undefined && areaId !== "undefined" && areaId.indexOf("E") !== -1) {
      // check the column with gender info, F means female
      const gender = jsonObj["Gender_AUT13"] == "F" ? "female" : "male";
      const NCYear = jsonObj["NCyearActual_AUT13"];
      const schoolId = jsonObj["Estab_AUT13"];
      if (!dataObj[areaId]) {
        // assign dataObj as a dic with areaId
        dataObj[areaId] = {};
      }
      if (!dataObj[areaId][gender]) {
        // each areaId element of dataObj contains two genders seperately
        dataObj[areaId][gender] = {};
      }
      if (!dataObj[areaId][gender][NCYear]) {
        // assign element with each yearGroup
        dataObj[areaId][gender][NCYear] = {};
        dataObj[areaId][gender][NCYear] = {
          "ratio": {},
          "total": 0,
        };
      }
      // calculate the total number of pupils from same yearGroup from same areaId and same gender
      dataObj[areaId][gender][NCYear]["total"] += 1;
      if (!dataObj[areaId][gender][NCYear]["ratio"][schoolId]) {
        // calculate for each schools, the number of pupils with same yeargroup and gender
        // also from same LSOA
        dataObj[areaId][gender][NCYear]["ratio"][schoolId] = 0;
      }
      dataObj[areaId][gender][NCYear]["ratio"][schoolId] += 1;
    }
  }

  return Wrangler;
}());
