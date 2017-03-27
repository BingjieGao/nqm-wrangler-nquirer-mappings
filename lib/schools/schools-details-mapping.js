module.exports = (function() {
  "use strict";
  const schoolsPopulation = "HJfA7HXtig";
  const schoolsRatios = "H1lZ4tOYie";
  const Promise = require("bluebird");
  const Wrangler = function(input, output, context, sourceId, destStream, dataArray) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    tdxApi.getDistinctAsync(schoolsPopulation, "areaId", null, null, null)
      .then((result) => {
        console.log(result);
        return Promise.each(result.data, (areaId) => {
          const filter = {
            areaId: areaId,
          };
          return tdxApi.getDatasetDataAsync(schoolsPopulation, filter, null, null)
            .then((response) => {
              return tdxApi.getAggregateDataAsync()
            })
        });
      })
      .catch((err) => {
        console.log(`get tbx data error ${err.message}`);
      });
  };

  return Wrangler;
}());
