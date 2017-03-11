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
  const csvParser = function(Wrangler, input, output, sourceStream, destStream, mappingString) {
    // Create a promise to wrangle the given source stream to the destination.
    return new Promise((resolve, reject) => {
      // changed, keep the header for better reading from original excel table
      const parserOptions = {ignoreEmpty: true};
      const wrangler = new Wrangler(input, output, destStream, mappingString);
      // Use the csv parser to read from the source, and emit an event for every JSON object.
      csv(parserOptions)
        .fromStream(sourceStream)
        .on("json", (json, rowIndex) => {
          wrangler.wrangler(json, rowIndex);
        })
        .on("done", () => {
          // Parser has finished.
          if (typeof wrangler.finish === "function") {
            wrangler.finish();
          }
          output.debug("finished wrangling");

          destStream.on("finish", () => {
            destStream.end();
            resolve();
          });
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
