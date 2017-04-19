module.exports = (function() {
  "use strict";

  const fs = require("fs");
  const request = require("request");
  const wranglerClass = require("./lib/wrangler-factory");
  const csvParser = require("./lib/csv-parser");
  const lineParser = require("./lib/readline-parser");
  const Promise = require("bluebird");
  const request_type = require("./lib/request-type");
  const parser_type = require("./lib/parser-type");
  const TdxDatasetRequest = require("./lib/tdx-dataset-request");

  function databot(input, output, context) {
    let parser;
    // Load particular function file from "./lib" according to input mappingType
    const mappingType = wranglerClass(input.mappingType);
    const requestType = request_type(input.mappingType);
    const parserType = parser_type(input.mappingType);
    if (parserType) {
      parser = lineParser;
    } else parser = csvParser;

    // Databot can accept the source data as either a TDX resource ID refering to a raw file, or a URL.
    if (!input.sourceResource && !input.sourceURL && !input.sourceFilePath) {
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
    // output.setFileStorePath("./jsonFiles");
    // Generate the output file based on the given output name input.
    const outputFilePath = output.generateFileStorePath("json");
     // Create the output stream.
    const destStream = fs.createWriteStream(outputFilePath, {flags: input.appendOutput ? "a" : "w"});

    output.debug("fetching source for %s, writing to %s", input.sourceResource || input.sourceURL, outputFilePath);

    // Use the csv parser to read from the source, and emit an event for every JSON object.
    // The default csv parser options uses the first row of the csv to determine the JSON object properties.
    // csvtojson is very powerful - if you need more complex parsing (e.g. nested documents etc) it probably
    // already supports it - see https://www.npmjs.com/package/csvtojson
    // const parserOptions = {};
    let tdxDatasetRequest;
    let mappingTypeInstance = null;
    if (requestType === "tdx-request") {
      tdxDatasetRequest = new TdxDatasetRequest(input, output, context, destStream);
    } else if (requestType === "multiple-file") {
      console.log("multiple files");
      mappingTypeInstance = new mappingType(input, output, destStream);
    }

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
      const wrangler = mappingTypeInstance == null ? mappingType : mappingTypeInstance;
      if (requestType === "tdx-request") return tdxDatasetRequest.tdxDatasetRequest(mappingType, source, destStream);
      else parser(wrangler, input, output, sourceStream, destStream, mappingString);
    })
    .then(() => {
      // destStream.end() is called in each write to file process separately
      output.debug("output file path is %s", outputFilePath);
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

