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
  const dataObj = {};
  const dataArray = [];
  let gender = null;
  const readAndCal = function(jsonObj, input, destStream) {
    const serviceId = jsonObj["PRACTICE_CODE"];
    _.forEach(jsonObj, (key, value) => {
      if (key.match(/lsoa+\d*/g) && value !== undefined && value !== "" && value.match(/E+\d*/g)) {
        /* a bit mess in original Excel file, filter the actual LSOA11CD codes
         key(excel table header) matches strings like lsoa1, lsoa2...
         corresponding value field should not be empty, must match strings contains E and numbers
         */
        if (!dataObj[key]) dataObj[key] = {};
        dataObj[key][serviceId] = value;
      } else if (value.indexOf("Patients") !== 1 && gender === null) {
        // grab the gender from file, e.g. in 10-2016 file the gender is given in this way
        gender = value.slice(0, value.indexOf("Patients") - 1);
      }
    });
    _.forEach(dataObj, (value, key) => {
      const persons = {};
      _.forEach(value, (num, serviceId) => {
        persons[serviceId] = num;
      });
      const rObj = {
        area_id: key,
        gender: gender,
        period: input.period ? input.period : "UNKNOWN",
        persons: persons,
      };
      dataArray.push(rObj);
    });
    console.log(dataArray);
    return dataArray;
  };
  return readAndCal;
}());
