module.exports = (function() {
  "use strict";

  const fs = require("fs");
  const request = require("request");
  const wranglerClass = require("./lib/wrangler-factory");
  const csvParser = require("./lib/csv-parser");

  function databot(input, output, context) {
    // Load particular function file from "./lib" according to input mappingType
    const mappingType = wranglerClass(input.mappingType);

    // Databot can accept the source data as either a TDX resource ID refering to a raw file, or a URL.
    if (!input.sourceResource && !input.sourceURL && !input.sourceFilePath || !mappingType) {
      output.error("invalid arguments - please supply either a source or valid mappingType");
      process.exit(1);
    }

    // Load the source data as an HTTP stream.
    let sourceStream;
    if (input.sourceFilePath) {
      // Source is a file on local disk.
      sourceStream = fs.createReadStream(input.sourceFilePath.split(","));
    } else if (input.sourceResource) {
      output.debug("sourceResource existed, parsing csv files from TBX rawFile");
      sourceStream = context.tdxApi.getRawFile(input.sourceResource);
    } else {
      sourceStream = request.get(input.sourceURL);
    }
    // just for local test if generated json file is corret
    output.setFileStorePath("./jsonFiles");
    // Generate the output file based on the databot instance id.
    const outputFilePath = output.getFileStorePath(`${context.instanceId}-output.json`);
    const destStream = fs.createWriteStream(outputFilePath);

    output.debug("fetching source for %s, writing to %s", input.sourceResource || input.sourceURL, outputFilePath);

    // Use the csv parser to read from the source, and emit an event for every JSON object.
    // The default csv parser options uses the first row of the csv to determine the JSON object properties.
    // csvtojson is very powerful - if you need more complex parsing (e.g. nested documents etc) it probably
    // already supports it - see https://www.npmjs.com/package/csvtojson
    // const parserOptions = {};

    // Promise.each(sources, (sources) => {
    //   return csvParser(mappingType, input, output, sourceStream, destStream);
    // })
    csvParser(mappingType, input, output, sourceStream, destStream)
      .then(() => {
        destStream.end();
        output.result({outputFilePath: outputFilePath});
      })
      .catch((err) => {
        output.debug(err.message);
      });
  }
  let input = null;
  if (process.env.NODE_ENV === "test") {
    // Requires nqm-databot-gpsgrab.json file for testing
    input = require("./databot-test.js")(process.argv[2]);
  } else {
    // Load the nqm input module for receiving input from the process host.
    input = require("nqm-databot-utils").input;
  }

// Read any data passed from the process host. Specify we're expecting JSON data.
  input.pipe(databot);
}());
