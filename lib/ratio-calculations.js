module.exports = (function() {
  "use strict";
  const ageRatio = require("./age-ratio-each-lsoa");
  const genderRatio = require("./ratio-each-service");

  const Wrangler = function(input, output, destStream, mappingString) {
    this.Wrangler = require(`./${mappingString}`);
    return new this.Wrangler(input, output, destStream, mappingString);
  };
  return Wrangler;
}());
