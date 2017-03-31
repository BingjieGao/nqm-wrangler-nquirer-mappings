module.exports = (function() {
  "use strict";

  const Promise = require("bluebird");
  const readline = require('readline');
  /*
   * Parses the json source stream using the given Wrangler class.
   *
   */
  const lineParser = function(Wrangler, input, output, sourceStream, destStream, mappingString) {
    const rl = readline.createInterface({
      input: sourceStream,
    });
    const wrangler = new Wrangler(input, output, destStream);
    // Create a promise to wrangle the given source stream to the destination.
    return new Promise((resolve, reject) => {
      rl.on("line", (json) => {
        json = JSON.parse(json);
        wrangler.wrangler(json, mappingString);
      })
      .on("close", () => {
        output.debug("wrangler finished");
      });
    });
  };
  return lineParser;
}());
