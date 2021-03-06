module.exports = (function() {
  "use strict";
  // rawFile is gp-reg-patients-LSOA
  /**
   * mapping with serviceIds to LSOAs
   * people registered in one service maps to LSOA codes these people are from
   */
  const _ = require("lodash");
  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
  };
  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const parentType = "PRACTICE_CODE";
    const childType = "LSOA11CD";
    const parentId = jsonObj["PRACTICE_CODE"];
    _.forEach(jsonObj, (value, key) => {
      if (key.match(/lsoa+\d*/g) && value !== undefined && value !== "" && value.match(/E+\d*/g)) {
        /* a bit mess in original Excel file, filter the actual LSOA11CD codes
         key(excel table header) matches strings like lsoa1, lsoa2...
         corresponding value field should not be empty, must match strings contains E and numbers
         */
        const rObj = {
          parentType: parentType,
          childType: childType,
          parentId: parentId,
          childId: value,
        };
        this.destStream.write(`${JSON.stringify(rObj)}\n`);
      }
    });
  };

  Wrangler.prototype.finish = function() {
    this.destStream.end();
  };
  return Wrangler;
}());
