module.exports = (function() {
  "use strict";
  /**
   * merge the seperate mapping json files to one
   * in order for tdx databot uploading as one big dataset
   *
   * input and output schemas are expected to be the same
   * which contains
   * {
   *     parentId: "string",
   *     childId:"string",
   *     parentType: "string",
   *     childType: "string",
   *     mappingType: "string",
   *   };
   *
   */
  const Wrangler = function(input, output, destStream) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
  };

  Wrangler.prototype.wrangler = function(jsonObj) {
    // check if the jsonObj read in is defined
    if (jsonObj !== undefined) {
      const parentId = jsonObj["parentId"];
      const parentType = jsonObj["parentType"];
      const childId = jsonObj["childId"];
      const childType = jsonObj["childType"];
      const mappingType = jsonObj["mappingType"];
      if (parentId && mappingType && childId) {
        const rObj = {
          parentId: parentId,
          childId: childId,
          parentType: parentType,
          childType: childType,
          mappingType: mappingType,
        };
        // write to the output file
        this.destStream.write(`${JSON.stringify(rObj)}\n`);
      }
    }
  };
  return Wrangler;
}());
