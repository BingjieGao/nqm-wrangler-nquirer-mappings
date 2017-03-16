module.exports = (function() {
  /*
  * Generate an array of No. of people from each area_id(LSOA) registered in each different
    GP(serviceId)
    each returned object: e.g.
    {
      area_id:E...,
      gender: "female" or "male",
      period: "10-2016" // depends on the input from databot inputs
      persons: {
        "A81001": 10
      }
    }
    @param dataArray - final returned array
    @param dataObj - dictionary mapping from LSOA to serviceIds
  */
  "use strict";
  const _ = require("lodash");
  const readAndCalculate = function(jsonObj, dataObj, saveData, rowIndex) {
    if (rowIndex % 2 === 0) {
      _.forEach(jsonObj, (value, key) => {
        if (key.match(/lsoa+\d*/g) && value !== undefined && value.match(/E+\d*/g)) {
          saveData[key] = value;
        }
      });
    } else if (rowIndex % 2 !== 0) {
      const serviceId = jsonObj["PRACTICE_CODE"];
      _.forEach(jsonObj, (value, key) => {
        if (key.match(/lsoa+\d*/g) && value !== undefined && isNaN(value) === false) {
          const areaId = saveData[key];
          if (!dataObj[areaId]) dataObj[areaId] = {};
          dataObj[areaId][serviceId] = value;
        }
      });
    }
  };
  return readAndCalculate;
}());
