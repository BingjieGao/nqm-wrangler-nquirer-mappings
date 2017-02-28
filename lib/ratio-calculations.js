module.exports = (function() {
  "use strict";
  const Wrangler = function(input, output, destStream, mappingString) {
    this.Wrangler = require(`./${mappingString}`);
    return new this.Wrangler(input, output, destStream, mappingString);
  };
  return Wrangler;
}());
