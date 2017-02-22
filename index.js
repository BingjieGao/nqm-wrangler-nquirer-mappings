module.exports = (function() {
  "use strict";

  const fs = require("fs");
  const request = require("request");
  const csv = require("csvtojson");
  const path = require("path");

  function databot(input, output, context) {
    // Load particular function file from "./lib" according to input mappingType
    const mappingType = require(path.join(__dirname, path.join("lib", input.defaultMappingTypes[input.mappingType])));

    // Databot can accept the source data as either a TDX resource ID refering to a raw file, or a URL.
    if (!input.sourceResource && !input.sourceURL) {
      output.error("invalid arguments - please supply either a source resource id or source url");
      process.exit(1);
    }
    // Load the source data as an HTTP stream.
    let sourceStream;
    if (input.sourceResource) {
      output.debug("sourceResource existed, parsing csv files from TBX rawFile");
      sourceStream = context.tdxApi.getRawFile(input.sourceResource[input.mappingType]);
    } else {
      sourceStream = request.get(input.sourceURL);
    }
    output.setFileStorePath("./jsonFiles");
    // Generate the output file based on the databot instance id.
    const outputFilePath = output.getFileStorePath(`${context.instanceId}-output.json`);
    const destStream = fs.createWriteStream(outputFilePath);
        
    output.debug("fetching source for %s, writing to %s", input.sourceResource || input.sourceURL, outputFilePath);
    
    // Use the csv parser to read from the source, and emit an event for every JSON object.
    // The default csv parser options uses the first row of the csv to determine the JSON object properties.
    // csvtojson is very powerful - if you need more complex parsing (e.g. nested documents etc) it probably
    // already supports it - see https://www.npmjs.com/package/csvtojson
    const parserOptions = {};
    csv(parserOptions)
      .fromStream(sourceStream)
      .on("json", (json) => {
        // A json object has been parsed => write it to the destination stream.
        mappingType(json, destStream);
        // destStream.write(JSON.stringify(outputJson));
      })
      .on("done", () => {
        // Parser has finished.
        output.debug("finished converting csv to json");
        // Close the destination stream.
        destStream.close();
        // Output the databot result, which is the output file path. This databot can then be chained onto an import
        // databot that will upload and import the file to the TDX.
        output.result({outputFilePath: outputFilePath});
      })
      .on("error", (err) => {
        // An error occurred during parsing.
        output.abort("failure during csv parse: %s", err.message);
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
