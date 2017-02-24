module.exports = (function() {
  "use strict";
  const tdxTypeArray = ["cty15cd-lsoa11cd", "ratio-mapping"];
  const tdxRequest = function(mappingType) {
    if (tdxTypeArray.indexOf(mappingType) !== -1) return true;
    else return false;
  };
  return tdxRequest;
}());
