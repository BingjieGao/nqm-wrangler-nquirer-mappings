module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");
  let dataArray = ["333333333", "3333333333333", "44444444444444"];
  const tdxDatasetRequest = function(mappingType, input, output, context, source, destStream) {
    output.debug("requesting data from tdx");
    // return Promise.each(dataArray, (data) => {
    //   destStream.write(`${JSON.stringify(data)}\n`);
    // })
    // .catch((err) => {
    //   output.debug("err %s", err);
    // });
    mappingType(input, output, context, source, destStream);
  };
  return tdxDatasetRequest;
}());
