module.exports = (function() {
  "use strict";

  const Promise = require("bluebird");
  const readline = require("readline");
  /**
   * Parser reads each line of newline-delimiter json
   * for each json object, Wrangler class to perform the actual data manipulation.
   */

  const lineParser = function(Wrangler, input, output, sourceStream, destStream, mappingString) {
    const rl = readline.createInterface({
      input: sourceStream,
    });
    const wrangler = new Wrangler(input, output, destStream);
    // Create a promise to wrangle the given source stream to the destination.
    return new Promise((resolve, reject) => {
      rl.on("line", (json) => {
        // read each line as a json string
        // parser each line as a valid json object
        json = JSON.parse(json);
        wrangler.wrangler(json, mappingString);
      })
      .on("close", () => {
        output.debug("wrangler finished");
        resolve();
      });
    });
  };
  return lineParser;
}());
