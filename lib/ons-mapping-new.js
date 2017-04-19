module.exports = (function() {
  "use strict";
  /**
   * direct map from raw csv file, from CCG16CD to LSOA11CD
   * input file source is expecting as LSOA11_CCG16_LAD16_EN_LU.csv
   */

  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
  };

  /**
   * @param {*} jsonObj - csv-parsed json object from each line of raw csv file
   * is expected to be
   * {
   *    CCG16CD: "E38000001",
   *    LSOA11CD: "E01000001"
   * }
   */
  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const rObj = {
      parentType: "CCG16CD",
      childType: "LSOA11CD",
      mappingType: "patients-mapping",
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
