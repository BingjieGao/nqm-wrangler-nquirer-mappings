module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  // lsoa code column name in raw csv file
  const parentType = "LSOA11CD";
  // lad code column name in raw csv file
  const childType = "schoolId";
  /**
   *
   * @param {*} count - a number indicates if all files are wranglered seperately and finished
   * @param {*} lsoaObj - saved dict with county code and childIds lad codes
   * expecting structure is
   * {
   *    "lsoa15CD code 1": ["lad code 1", "lad code 2", ...],
   *    "lsoa15CD code 2": ["lad code 1", "lad code 2", ...],
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
    this.dataObj = {};
  };

  /**
   * @param {*} jsonObj - csv-parsed json object from each line of raw csv file
   */

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const lsoaId = jsonObj["LLSOA_AUT13"];
    const schoolId = jsonObj["URN_AUT13"];
    if (!this.dataObj[lsoaId]) this.dataObj[lsoaId] = {};
    if (!this.dataObj[lsoaId][schoolId]) this.dataObj[lsoaId][schoolId] = 1;
  };

  Wrangler.prototype.finish = function() {
    _.forEach(this.dataObj, (schoolIdObj, lsoaId) => {
      const rObj = {
        parentId: lsoaId,
        parentType: parentType,
        mappingType: "schoolId-lsoa11cd",
        childType: childType,
      };
      _.forEach(schoolIdObj, (val, schoolId) => {
        rObj.childId = schoolId;
        this.destStream.write(`${JSON.stringify(rObj)}\n`);
      });
    });
  };
  return Wrangler;
}());
