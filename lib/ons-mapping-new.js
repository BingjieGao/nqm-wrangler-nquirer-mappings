module.exports = (function() {
  "use strict";
  // function takes input of each line as a json Object
  // destStream should be the createWriteStream from index.js
  const wrangle = function(jsonObj, input, destStream, mappingString) {
    const rObj = {
      parentType: "CCG16CD",
      childType: "LSOA11CD",
    };
    rObj.parentId = jsonObj[rObj.parentType];
    rObj.childId = jsonObj[rObj.childType];
    destStream.write(`${JSON.stringify(rObj)}\n`);
  };
  return wrangle;
}());
