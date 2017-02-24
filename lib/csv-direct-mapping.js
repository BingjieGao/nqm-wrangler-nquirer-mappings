module.exports = (function() {
  "use strict";
  // function takes input of each line as a json Object
  // destStream should be the createWriteStream from index.js
  const wrangle = function(jsonObj, input, destStream, mappingString) {
    const mappingType = "ons-mapping";
    // find default mapping type sources
    // ---------------------------------------------------------------
    // need to solve if mappingString for this case is empty
    // ---------------------------------------------------------------
    const typeArray = mappingString.split("-");
    const parentType = typeArray[0].toUpperCase();
    const childType = typeArray[1].toUpperCase();
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
      mappingType: mappingType,
    };
    destStream.write(`${JSON.stringify(rObj)}\n`);
  };

  return wrangle;
}());
