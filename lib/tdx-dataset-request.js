module.exports = (function() {
  "use strict";
  const tdxDatasetRequest = function(mappingType, input, output, context, source, destStream) {
    source = source.split("/");
    const sourceId = source[source.length - 2];
    output.debug(sourceId);
    output.debug("requesting data from tdx");
    mappingType(input, output, context, source, destStream);
  };
  return tdxDatasetRequest;
}());
