module.exports = (function() {
  "use strict";
  const schoolsPopulation = "HJfA7HXtig";
  const schoolsRatios = "H1lZ4tOYie";
  const Promise = require("bluebird");
  const _ = require("lodash");
  const Wrangler = function(input, output, context, sourceId, destStream, dataArray) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    tdxApi.getDistinctAsync(schoolsPopulation, "areaId", null, null, null)
      .then((result) => {
        return Promise.each(result.data, (areaId) => {
          const filter = {
            areaId: areaId,
          };
          const opts = {
            yearGroup: 1,
            limit: 352,
          };
          return tdxApi.getDatasetDataAsync(schoolsPopulation, filter, null, opts)
            .then((response) => {
              return Promise.each(response.data, (populationObj) => {
                const ratioFilter = {
                  areaId: populationObj.areaId,
                  gender: populationObj.gender,
                  yearGroup: populationObj.yearGroup,
                };
                return tdxApi.getDatasetDataAsync(schoolsRatios, ratioFilter, null, null)
                  .then((result) => {
                    if (result.data[0] !== undefined && result.data[0] !== "undefined") {
                      _.forEach(result.data[0].ratio, (eachRatio, schoolId) => {
                        const rObj = {
                          areaId: result.data[0].areaId,
                          gender: result.data[0].gender,
                          yearGroup: result.data[0].yearGroup,
                          schoolId: schoolId,
                          persons: populationObj.persons * eachRatio,
                        };
                        destStream.write(`${JSON.stringify(rObj)}\n`);
                      });
                    }
                  })
                  .catch((err) => {
                    if (err.code === "'ETIMEDOUT'") {
                      return {};
                    }
                  });
              });
            });
        });
      })
      .then(() => {
        destStream.end();
      })
      .catch((err) => {
        console.log(`get tbx data error ${err.message}`);
      });
  };

  return Wrangler;
}());
