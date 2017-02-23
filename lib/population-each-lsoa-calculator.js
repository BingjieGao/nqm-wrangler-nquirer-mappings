module.exports = (function() {
  /*
  * Generates an data object which contains the total population from each
    area_id(lsoa) registered in gps.
   */
  "use strict";
  const _ = require("lodash");
  let dataObj = {};
  let gender = null;
  let rValue = {};
  const readAndCal = function(jsonObj, input, destStream) {
    _.forEach(jsonObj, (key, value) => {
      if (key.match(/lsoa+\d*/g) && value !== undefined && value !== "" && value.match(/E+\d*/g)) {
        /* a bit mess in original Excel file, filter the actual LSOA11CD codes
         key(excel table header) matches strings like lsoa1, lsoa2...
         corresponding value field should not be empty, must match strings contains E and numbers
         */
        if (!dataObj[key]) dataObj[key] = 0;
        dataObj[key] += value;
      } else if (value.indexOf("Patients") !== 1 && gender === null) {
        // grab the gender from file, e.g. in 10-2016 file the gender is given in this way
        gender = value.slice(0, value.indexOf("Patients") - 1);
      }
    });
    rValue[gender] = dataObj;
    return rValue;
  };
  return readAndCal;
}());
