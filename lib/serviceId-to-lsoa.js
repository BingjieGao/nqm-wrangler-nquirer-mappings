module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const readAndMap = function(jsonObj, destStream) {
    const parentType = "PRACTICE_CODE";
    const childType = "LSOA11CD";
    const parentId = jsonObj["PRACTICE_CODE"];
    _.forEach(jsonObj, (value, key) => {
      if (key.match(/lsoa+\d*/g) && value !== undefined && value !== "" && value.match(/E+\d*/g)) {
        // a bit mess in original Excel file, filter the actual LSOA11CD codes
        // key(excel table header) matches strings like lsoa1, lsoa2...
        // corresponding value field should not be empty, must match strings contains E and numbers
        const rObj = {
          parentType: parentType,
          childType: childType,
          parentId: parentId,
          childId: value,
        };
        const rString = JSON.stringify(rObj) + "\n";
        destStream.write(rString);
      }
    });
  };
  return readAndMap;
}());
