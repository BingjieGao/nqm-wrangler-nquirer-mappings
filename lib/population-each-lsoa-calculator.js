module.exports = (function() {
  "use strict";
/**
  * Generates an data object which contains the total population from each
  * area_id(lsoa) registered in gps.
  *
  * the first line, is the header which gives keys
  * lsoa1, lsoa2, lsoa3,...
  *
  * data starts from the second row
  *
  * the third line, and all the odd number lines, where rowIndex is an odd number, it has
  * number of people accordingly to each LSOA codes in previes line.
  * when rowIndex is an odd number, it is expected each jsonObj like
  * {
  *   "lsoa1": 10,
  *   "lsoa2": 20,
  *   ... ...      
  * }
  *
  * only data in odd number of rowIndex would be used for calculating the total number of people
  * registered from each LSOA
  */
  /**
   * @param {*} dataObj - dict saved total number of people accordingly to each LSOA
   *
   * @param {*} saveObj - previously saved dict which offers all valid LSOA codes
   */
  const _ = require("lodash");
  const readAndCalculate = function(jsonObj, dataObj, saveObj, rowIndex) {
    if (rowIndex % 2 !== 0) {
      _.forEach(jsonObj, (value, key) => {
        // keep fields with keys like "lsoa1", rule out lsoa codes that is undefined and not LSOA11CD format
        if (key.match(/lsoa+\d*/g) && value !== undefined && isNaN(value) === false) {
          const areaId = saveObj[key];
          if (areaId !== undefined) {
            // check if saved dict has a matched valid lsoa code
            if (!dataObj[areaId]) dataObj[areaId] = 0;
            dataObj[areaId] += Number(value);
          }
        }
      });
    }
  };
  return readAndCalculate;
}());
