module.exports = (function() {
  "use strict";
  const tdxTypeArray = ["cty15cd-lsoa11cd", "ratio-mapping", "yearGroup-ageBand-mapping", "ccg16cd-lsoa11cd", "schools-details"];
  const multipleFile = ["ratio-each-service"];
  const tdxRequest = function(mappingType) {
    if (tdxTypeArray.indexOf(mappingType) !== -1) return "tdx-request";
    else if (multipleFile.indexOf(mappingType) !== -1) return "multiple-file";
  };
  return tdxRequest;
}());
