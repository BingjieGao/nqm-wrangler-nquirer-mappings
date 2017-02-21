module.exports = (function() {
  "use strict";
  const readAndMap = function(jsonObj, destStream) {
    const parentType = "CCG16CD";
    const childType = "LSOA11CD";
    const parentId = jsonObj[parentType];
    const childId = jsonObj[childType];
    const rObj = {
      parentId: parentId,
      childId: childId,
      parentType: parentType,
      childType: childType,
    };
    destStream.write(JSON.stringify(rObj));
  };

  const mappingType = readAndMap;
  return mappingType;
}());
