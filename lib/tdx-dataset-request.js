module.exports = (function() {
  "use strict";
  /**
   * exports tdxRequest
   * @param sourceId - datasetId on tdx
   */
  const tdxDataRequest = function(input, output, context, destStream) {
    this.input = input;
    this.output = output;
    this.context = context;
    this.destStream = destStream;
    this.dataObject = {};
  };
  tdxDataRequest.prototype.tdxDatasetRequest = function(mappingType, source, destStream) {
    source = source.split("/");
    const sourceId = source[source.length - 2];
    this.output.debug(sourceId);
    return mappingType(this.input, this.output, this.context, sourceId, destStream, this.dataObject);
  };
  return tdxDataRequest;
}());
