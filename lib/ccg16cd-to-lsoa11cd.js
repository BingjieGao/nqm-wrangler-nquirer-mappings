module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");

  const Wrangler = function(input, output, context, sourceId, destStream, dataArray) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    return tdxApi.getDatasetData(sourceId, null, null, null)
      .then((result) => {
        return Promise.all(_.forEach(result.data, (dataObj) => {
          dataArray.push(dataObj);
        }));
      })
      .catch((err) => {
        output.debug(`requesting dataset ${sourceId} encountered error ${err}`);
      });
  };

  return Wrangler;
}());
