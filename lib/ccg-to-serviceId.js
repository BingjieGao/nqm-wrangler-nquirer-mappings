module.exports = (function() {
  "use strict";
  /**
   * maps CCG code and serviceIds within the ccg area
   *
   * input is expected as a jsonObj
   * {
   *    "ONS_CCG_CODE": "E3800001",
   *    "PRACTICE_CODE": "A8001"
   * }
   * column with header ONS_CCG_CODE represents a ccg code
   * column with header PRACTICE_CODE represents a serviceId
   *
   * output schema is:
   * {
   *    "parentId": "E3800001",
   *    "parentType": "CCG16CD",
   *    "childId": "A8001"
   *    "childType": "PRACTICE_CODE"
   * }
   */
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

  Wrangler.prototype.finish = function() {
    this.destStream.end();
  };

  return Wrangler;
}());
