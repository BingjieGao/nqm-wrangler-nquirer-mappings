module.exports = (function() {
  "use strict";

  const Promise = require("bluebird");
  const csv = require("csvtojson");

  /*
   * Parses the CSV source stream using the given Wrangler class.
   *
   * This amounts to parsing the CSV data line-by-line in a memory-efficient manner and handing off to the
   * Wrangler class to perform the actual data manipulation.
   *
   * This allows different types of Wranglers to be 'plugged in' to CSV stream data.
   *
   * The source data can be of unlimited size.
   *
   */
  const csvParser = function(Wrangler, input, output, sourceStream, destStream) {
    // Create a promise to wrangle the given source stream to the destination.
    return new Promise((resolve, reject) => {
      // Create a wrangler using the given constructor.
      //const wrangler = new Wrangler(json, destStream);

      // Switch off automatic header parsing as we handle headers ourselves.
      const parserOptions = {};

      // Use the csv parser to read from the source, and emit an event for every JSON object.
      csv(parserOptions)
        .fromStream(sourceStream)
        .on("json", (json) => {
          Wrangler(json, destStream);
        })
        .on("done", () => {
          // Parser has finished.
          output.debug("finished wrangling");
          resolve();
        })
        .on("error", (err) => {
          // An error occurred during parsing.
          output.error("failure during wrangling: [%s]", err.message);
          reject(err);
        });
    });
  };
  return csvParser;
}());
