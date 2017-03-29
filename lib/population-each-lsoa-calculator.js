module.exports = (function() {
  /*
  * Generates an data object which contains the total population from each
    area_id(lsoa) registered in gps.
   */
  "use strict";
  const _ = require("lodash");
  const readAndCalculate = function(jsonObj, dataObj, saveObj, rowIndex) {
    if (rowIndex % 2 !== 0) {
      _.forEach(jsonObj, (value, key) => {
        // keep fields with keys like "lsoa1", rule out lsoa codes that is undefined and not LSOA11CD format
        if (key.match(/lsoa+\d*/g) && value !== undefined && isNaN(value) === false) {
          const areaId = saveObj[key];
          if (areaId !== undefined) {
            if (!dataObj[areaId]) dataObj[areaId] = 0;
            dataObj[areaId] += Number(value);
          }
        }
      });
    }
  };
  return readAndCalculate;
}());
