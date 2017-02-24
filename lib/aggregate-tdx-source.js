module.exports = (function() {
  "use strict";
  const aggregateTypeArray = ["cty15cd-lsoa11cd", "ratio-mapping"];
  const aggregate = function(mappingType) {
    if (aggregateTypeArray.indexOf(mappingType)) return true;
    else return false;
  };
  return aggregate;
}());
