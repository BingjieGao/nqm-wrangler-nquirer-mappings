module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");

  const Wrangler = function(input, output, context, sourceId, destStream, dataObject) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    if (Object.keys(dataObject).length === 0) {
      return tdxApi.getDatasetDataAsync(sourceId, null, null, null)
        .then((result) => {
          _.forEach(result.data, (dataObj) => {
            if (!dataObject[dataObj["parent_id"]]) {
              dataObject[dataObj["parent_id"]] = [];
            }
            dataObject[dataObj["parent_id"]].push(dataObj["child_id"]);
          });
        })
        .catch((err) => {
          output.debug(`requesting dataset ${sourceId} encountered error ${err}`);
        });
    } else {
      return Promise.all(_.forEach(dataObject, (gpArray, key) => {
        const pipeline = [
          {
            $match: {
              parentId: {
                $in: gpArray,
              },
            },
          },
        ];
        return tdxApi.getAggregateDataAsync(sourceId, JSON.stringify(pipeline), null)
          .then((result) => {
            Promise.all(_.map(result.data, (serviceObj) => {
              const rObj = {
                parentId: key,
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
          .catch((err) => {
            output.debug(`catch error when requesting from source ccg-to-serviceIds ${err}`);
          });
      }))
      .then((result) => {
        destStream.end();
      })
      .catch((err) => {
        output.debug(`${err.message} when write to file`);
      });
    }
  };

  return Wrangler;
}());
