module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");
  const Wrangler = function(input, output, context, source, destStream) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    const genderFilter = {
      ratioType: "genderRatio",
    };

    return tdxApi.getDatasetDataCountAsync(source, genderFilter)
      .then((result) => {
        output.debug(result);
      })
      .catch((err) => {
        output.debug(`requesting source ${source} encountered error ${err}`);
      });
  };

  return Wrangler;
}());
