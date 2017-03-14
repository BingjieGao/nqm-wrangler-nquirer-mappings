module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");

  const Wrangler = function(input, output, context, sourceId, destStream, dataArray) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    if (dataArray.length === 0) {
      return tdxApi.getDatasetDataAsync(sourceId, null, null, null)
        .then((result) => {
          _.forEach(result.data, (dataObj) => {
            const rObj = {
              parentId: result.data.parentId,
              childArray: [],
            };
            rObj.childArray.push(dataObj.childId);
          });
        })
        .catch((err) => {
          output.debug(`requesting dataset ${sourceId} encountered error ${err}`);
        });
    } else {
      return Promise.all(_.map(dataArray, (dataObj) => {
        const pipeline = [
          {
            $match: {
              parentId: {
                $in: dataObj.childArray,
              },
            },
          },
        ];
        return tdxApi.getAgregateDataAsync(sourceId, JSON.stringify(pipeline), null)
          .then((result) => {
            Promise.all(_.map(result.data, (serviceObj) => {
              const rObj = {
                parentId: dataObj.parentId,
                parentType: "CCG16CD",
                childId: serviceObj.childId,
                childType: "LSOA11CD",
              };
              return destStream.write(`${JSON.stringify(rObj)}\n`);
            }))
            .then((result) => {
              return {result};
            })
            .catch((err) => {
              output.debug(`catch error while writing to file ${err}`);
            });
          })
          .then((result) => {
            destStream.end();
          })
          .catch((err) => {
            output.debug(`catch error when requesting from source ccg-to-serviceIds ${err}`);
          });
      }));
    }
  };

  return Wrangler;
}());
