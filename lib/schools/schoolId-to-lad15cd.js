module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  // lad code column name in raw csv file
  const ladKey = "LAD15CD";
  /**
   * @param {*} ladObj - saved dict with lad codes and childIds schools URN
   * expecting structure is
   * {
   *    "LAD15CD code 1": ["URN code 1", "URN code 2", ...],
   *    "LAD15CD code 2": ["URN code 1", "URN code 2", ...],
   * }
   */
  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
    this.count = 0;
    this.ladObj = {};
  };

  /**
   * @param {*} jsonObj - csv-parsed json object from each line of raw csv file
   */

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const ladCode = jsonObj["DistrictAdministrative (code)"];
    const schoolId = jsonObj["URN"];
    // check if one LAD code existed
    if (!this.ladObj[ladCode]) this.ladObj[ladCode] = [];
    this.ladObj[ladCode].push(schoolId);
  };

  Wrangler.prototype.finish = function() {
    _.forEach(this.ladObj, (schoolIds, ladCode) => {
      const rObj = {
        parentId: ladCode,
        parentType: ladKey,
        mappingType: "schoolId-lad15cd",
      };
      _.forEach(schoolIds, (schoolId) => {
        rObj.schoolId = schoolId;
        this.destStream.write(`${JSON.stringify(rObj)}\n`);
      });
    });
  };
  return Wrangler;
}());
