module.exports = (function() {
  const _ = require("lodash");
  const Wrangler = function(input, output, destStream, mappingString) {
    this.output = output;
    this.input = input;
    this.destStream = destStream;
  };
  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const rObj = {};
    _.forEach(jsonObj, (value, key) => {
      rObj[key] = value;
    });
    this.destStream.write(`${JSON.stringify(rObj)}\n`);
  };

  return Wrangler;
}());
