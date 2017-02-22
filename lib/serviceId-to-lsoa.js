module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const readAndMap = function(jsonObj, destStream) {
    let rArray = [];
    const parentType = "PRACTICE_CODE";
    const childType = "LSOA11CD";
    const parentId = jsonObj["PRACTICE_CODE"];
    _.forEach(jsonObj, (value, key) => {
      if (key.match(/lsoa+\d*/g) && value !== undefined && value !== "" && isNaN(value)) {
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

  const mappingType = readAndMap;
  return mappingType;
}());
