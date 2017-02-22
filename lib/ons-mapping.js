module.exports = (function() {
  "use strict";
  // function takes input of each line as a json Object
  // destStream should be the createWriteStream from index.js
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
    const rString = JSON.stringify(rObj) + "\n";
    destStream.write(rString);
  };

  return readAndMap;
}());
