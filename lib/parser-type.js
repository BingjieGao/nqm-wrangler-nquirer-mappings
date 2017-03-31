module.exports = (function() {
  "use strict";
  /**
   * check whether this needs a csv parser or json line parser
   */
  const jsonSources = ["merge-json-files"];
  const parserType = function(mappingType) {
    if (jsonSources.indexOf(mappingType) !== -1) return true;
  };
  return parserType;
}());
