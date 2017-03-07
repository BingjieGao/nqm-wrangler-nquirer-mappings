module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
  };

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const parentType = "ONS_CCG_CODE";
    const childType = "PRACTICE_CODE";
    const rObj = {
      parentType: "CCG16CD",
      childType: childType,
      parentId: jsonObj[parentType],
      childId: jsonObj[childType],
    };

    this.destStream.write(`${JSON.stringify(rObj)}\n`);
  };

  return Wrangler;
}());
