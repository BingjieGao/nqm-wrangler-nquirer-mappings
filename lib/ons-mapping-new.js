module.exports = (function() {
  "use strict";
  // function takes input of each line as a json Object
  // destStream should be the createWriteStream from index.js

  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
  };

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const rObj = {
      parentType: "CCG16CD",
      childType: "LSOA11CD",
    };
    rObj.parentId = jsonObj[rObj.parentType];
    rObj.childId = jsonObj[rObj.childType];
    this.destStream.write(`${JSON.stringify(rObj)}\n`);
  };
  return Wrangler;
}());
