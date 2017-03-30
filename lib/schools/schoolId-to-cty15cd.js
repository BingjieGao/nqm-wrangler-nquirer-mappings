module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  // cty code column name in raw csv file
  const ctyKey = "CTY15CD";
  // lad code column name in raw csv file
  const ladKey = "LAD15CD";
  /**
   *
   * @param {*} count - a number indicates if all files are wranglered seperately and finished
   * @param {*} ctyObj - saved dict with county code and childIds lad codes
   * expecting structure is
   * {
   *    "CTY15CD code 1": ["lad code 1", "lad code 2", ...],
   *    "CTY15CD code 2": ["lad code 1", "lad code 2", ...],
   * }
   *
   *
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
    this.ctyObj = {};
    this.ladObj = {};
  };

  /**
   * @param {*} jsonObj - csv-parsed json object from each line of raw csv file
   */

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    if (jsonObj[ctyKey]) {
      // file input is cty15cd-to-lad15cd
      const ctyCode = jsonObj[ctyKey];
      // check if one CTY15CD existed
      if (!this.ctyObj[ctyCode]) this.ctyObj[ctyCode] = [];
      // push all lad codes as children array
      this.ctyObj[ctyCode].push(jsonObj[ladKey]);
    } else {
      const ladCode = jsonObj["DistrictAdministrative (code)"];
      const schoolId = jsonObj["URN"];
      // check if one LAD code existed
      if (!this.ladObj[ladCode]) this.ladObj[ladCode] = [];
      this.ladObj[ladCode].push(schoolId);
    }
  };

  Wrangler.prototype.finish = function() {
    // count increase by 1 each time finished one wrangler.wrangler
    this.count += 1;
    if (this.count === 2) {
      // check if two files are read through
      _.forEach(this.ctyCode, (ladArray, ctyCode) => {
        // iterating object with CTY15CD code and lad code array
        const rObj = {
          parentId: ctyCode,
          parentType: "CTY15CD",
          mappingType: "schools-mapping",
          childType: "schoolId",
        };
        _.forEach(ladArray, (ladCode) => {
          // for each lad code, find the children schools for this lad code
          const schoolIdArray = this.ladObj[ladCode];
          _.forEach(schoolIdArray, (schoolId) => {
            rObj.childId = schoolId;
            this.destStream.write(`${JSON.stringify(rObj)}\n`);
          });
        });
      });
    }
  };
  return Wrangler;
}());
