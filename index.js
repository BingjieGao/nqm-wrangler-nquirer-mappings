module.exports = (function() {
  "use strict";

  const fs = require("fs");
  const request = require("request");
  const wranglerClass = require("./lib/wrangler-factory");
  const csvParser = require("./lib/csv-parser");
  const Promise = require("bluebird");

  function databot(input, output, context) {
    // Load particular function file from "./lib" according to input mappingType
    const mappingType = wranglerClass(input.mappingType);

    // Databot can accept the source data as either a TDX resource ID refering to a raw file, or a URL.
    if (!input.sourceResource && !input.sourceURL && !input.sourceFilePath || !mappingType) {
      output.error("invalid arguments - please supply either a source or valid mappingType");
      process.exit(1);
    }
    // The sourceXXX input can be a comma separated list of values - parse this into an array of input sources.
    let sources = [];
    if (input.sourceFilePath) {
      // Source is file(s) on local disk.
      sources = input.sourceFilePath.split(",");
    } else if (input.sourceResource) {
      // Source is TDX resource(s).
      sources = input.sourceResource.split(",");
    } else {
      // Source is remote URL(s).
      sources = input.sourceURL.split(",");
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
    Promise.each(sources, (source) => {
      // Trim any whitespace from the source identifier.
      source = source.trim();
      output.debug("wrangling source %s, writing to %s", source, outputFilePath);
      // Load the source stream based on the type of source input given.
      let sourceStream;
      if (input.sourceFilePath) {
        // Source is a file on local disk.
        sourceStream = fs.createReadStream(source);
      } else if (input.sourceResource) {
        // Source is a TDX resource.
        sourceStream = context.tdxApi.getRawFile(source);
      } else {
        // Source is a remote URL.
        sourceStream = request.get(source);
      }
      const mappingString = input.sourceMapping[source] || "";
      output.debug("recognize mapingString is %s", mappingString);
      return csvParser(mappingType, input, output, sourceStream, destStream, mappingString);
    })
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

