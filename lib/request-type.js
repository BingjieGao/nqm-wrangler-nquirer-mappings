module.exports = (function() {
  "use strict";
  /**
   * check whether this needs tdx sources with tdxApi
   *
   * @param tdxTypeArray - an array contains mappingType which requires tdxApi
   * @param multipleFile - an array contains mappingType which requires multiple sources
   * to be saved in memory and calculation made on top of all of them together
   */
  const tdxTypeArray = ["cty15cd-lsoa11cd", "ratio-mapping", "yearGroup-ageBand-mapping", "ccg16cd-lsoa11cd", "schools-details"];
  const multipleFile = ["ratio-each-service"];
  const tdxRequest = function(mappingType) {
    if (tdxTypeArray.indexOf(mappingType) !== -1) return "tdx-request";
    else if (multipleFile.indexOf(mappingType) !== -1) return "multiple-file";
  };
  return tdxRequest;
}());
