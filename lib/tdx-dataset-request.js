module.exports = (function() {
  "use strict";

  const tdxDataRequest = function(input, output, context, destStream) {
    this.input = input;
    this.output = output;
    this.context = context;
    this.destStream = destStream;
  };
  tdxDataRequest.prototype.tdxDatasetRequest = function(mappingType, source, destStream) {
    source = source.split("/");
    const sourceId = source[source.length - 2];
    this.output.debug(sourceId);
    this.output.debug("requesting data from tdx");
    mappingType(this.input, this.output, this.context, sourceId, destStream);
  };
  return tdxDataRequest;
}());
