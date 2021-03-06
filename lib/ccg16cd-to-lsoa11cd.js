module.exports = (function() {
  "use strict";
  /**
   * matches CCG16CD to LSOA11CD in a way that people from these LSOAs registered in
   * services within one CCG
   *
   * input data from tbx is:(same as the output schema)
   * {
   *    "parentId": {
   *        "type": ["string"]
   *     },
   *    "childId": {
   *        "type": ["string"]
   *    },
   *    "parentType": {
   *        "type": ["string"]
   *    },
   *    "childType": {
   *        "type": ["string"]
   *    },
   *    "mappingType": {
   *        "type": ["string"]
   *    }
   * }
   * @param {*} sourceId - tdx resourceId
   * expected sources are: ccg16cd-to-serviceId and serviceId-to-lsoa11cd
   *
   * @param {*} dataObject - saved dict
   * expecting structure is
   * {
   *    "E38000075": ["A81001", "A81002"...],
   *    "E38000080": ["A81003", "A81002"...],
   * }
   */
  const _ = require("lodash");
  const Promise = require("bluebird");
  const Wrangler = function(input, output, context, sourceId, destStream, dataObject) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    if (Object.keys(dataObject).length === 0) {
      const opts = {
        parent_id: 1,
        limit: 7578,
      };
      return tdxApi.getDatasetDataAsync(sourceId, null, null, opts)
        .then((result) => {
          _.forEach(result.data, (dataObj) => {
            if (!dataObject[dataObj["parent_id"]]) {
              dataObject[dataObj["parent_id"]] = [];
            }
            // push serviceIds into an array, mapped with parentId which is a CCG code
            dataObject[dataObj["parent_id"]].push(dataObj["child_id"]);
          });
        })
        .catch((err) => {
          output.debug(`requesting dataset ${sourceId} encountered error ${err}`);
        });
    } else {
      const resultObj = {};
      return Promise.all(_.map(dataObject, (gpArray, key) => {
        const pipeline = [
          {
            $match: {
              parentId: {
                $in: gpArray,
              },
            },
          },
        ];
        if (!resultObj[key]) resultObj[key] = {};
        // sourceId here is expecting serviceId-to-lsoa11cd tdx resource
        return tdxApi.getAggregateDataAsync(sourceId, JSON.stringify(pipeline), null)
          .then((result) => {
            Promise.all(_.map(result.data, (serviceObj) => {
              if (!resultObj[key][serviceObj.childId]) {
                const rObj = {
                  parentId: key,
                  parentType: "CCG16CD",
                  childId: serviceObj.childId,
                  childType: "LSOA11CD",
                };
                resultObj[key][serviceObj.childId] = 1;
                return destStream.write(`${JSON.stringify(rObj)}\n`);
              } else {
                return {};
              }
            }))
            .then(() => {
              return {};
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
