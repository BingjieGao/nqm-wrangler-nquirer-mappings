module.exports = (function() {
  /*
  * Generate an array of No. of people from each area_id(LSOA) registered in each different
  * GP(serviceId)
  * the first line , is the header which gives keys, lsoa1, lsoa2, lsoa3,...
  *
  * data starts from the second row
  *
  * the 2nd line, and all the even number lines, where rowIndex is an even number, it contains
  * LSOA codes, E01000001, E01000002..., and also LSOA codes like W01000001 which should be eliminated
  *
  * the third line, and all the odd number lines, where rowIndex is an odd number, it has
  * number of people accordingly to each LSOA codes in previes line.
  *
  * each returned object: e.g.
  * {
  *    area_id:E...,
  *    gender: "female" or "male",
  *    period: "10-2016" // depends on the input from databot inputs
  *    persons: {
  *      "A81001": 10
  *    }
  *  }
  *  @param dataArray - final returned array
  *  @param dataObj - dictionary mapping from LSOA to serviceIds
  */
  "use strict";
  const _ = require("lodash");
  const readAndCalculate = function(jsonObj, dataObj, saveData, rowIndex) {
    if (rowIndex % 2 === 0) {
      _.forEach(jsonObj, (value, key) => {
        if (key.match(/lsoa+\d*/g) && value !== undefined && value.match(/E+\d*/g)) {
          // keep fields with keys like "lsoa1", rule out lsoa codes that is undefined and not LSOA11CD format
          saveData[key] = value;
        }
      });
    } else if (rowIndex % 2 !== 0) {
      const serviceId = jsonObj["PRACTICE_CODE"];
      _.forEach(jsonObj, (value, key) => {
        if (key.match(/lsoa+\d*/g) && value !== undefined && isNaN(value) === false) {
          // keep fields with keys like "lsoa1", rule out lsoa codes that is undefined and not LSOA11CD format
          const areaId = saveData[key];
          if (areaId !== undefined) {
            if (!dataObj[areaId]) dataObj[areaId] = {};
            dataObj[areaId][serviceId] = value;
          }
        }
      });
    }
  };
  return readAndCalculate;
}());
