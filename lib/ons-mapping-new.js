module.exports = (function() {
  "use strict";
  /**
   * direct map from raw csv file, from CCG16CD to LSOA11CD
   */

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
  Wrangler.prototype.finish = function() {
    this.destStream.end();
  };
  return Wrangler;
}());
