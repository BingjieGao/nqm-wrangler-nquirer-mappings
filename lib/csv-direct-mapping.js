module.exports = (function() {
  "use strict";
  // function takes input of each line as a json Object
  // destStream should be the createWriteStream from index.js
  const wrangle = function(jsonObj, input, destStream) {
    const typeArray = input.mappingType.split("-")[0];
    const parentType = typeArray[0];
    const childType = typeArray[1];
    const parentId = jsonObj[parentType];
    const childId = jsonObj[childType];
    const parentName = jsonObj[parentType.replace("CD", "NM")];
    const childName = jsonObj[childType.replace("CD", "NM")];
    const rObj = {
      parentId: parentId,
      childId: childId,
      parentType: parentType,
      childType: childType,
      parentName: parentName,
      childName: childName,
    };
    destStream.write(`${JSON.stringify(rObj)}\n}`);
  };

  return wrangle;
}());
