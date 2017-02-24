module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");
  const tdxDatasetRequest = function(mappingType, input, output, context, source, destStream) {
    output.debug("requesting data from tdx");
    return mappingType(input, output, context, source, destStream);
  };
  return tdxDatasetRequest;
}());
