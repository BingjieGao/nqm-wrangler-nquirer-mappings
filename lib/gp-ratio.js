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
        return recursiveRequest(tdxApi, source, destStream, 0, result.count);
      })
      .catch((err) => {
        output.debug(`requesting source ${source} encountered error ${err}`);
      });
  };

  function recursiveRequest(tdxApi, sourceId, destStream, index, endIndex) {
    const genderFilter = {
      ratioType: "genderRatio",
    };
    const genderOptions = {
      sort: {
        area_id: 1,
      },
      limit: 1,
      skip: index,
    };
    let areaId;
    let serviceRatio;
    let gender;
    return tdxApi.getDatasetDataAsync(sourceId, genderFilter, null, genderOptions)
      .then((result) => {
        areaId = result.data[0].area_id;
        gender = result.data[0].gender.toLowerCase();
        serviceRatio = result.data[0].serviceRatio;
        const agePipeline = [
          {
            $match: {
              gender: gender,
              serviceId: {
                $in: Object.keys(serviceRatio),
              },
            },
          },
        ];
        return tdxApi.getAggregateDataAsync(sourceId, JSON.stringify(agePipeline), null);
      })
      .then((result) => {
        const rObj = {
          areaId: areaId,
          gender: gender,
          serviceRatio: {},
        };
        _.forEach(result.data, (dataObj) => {
          rObj.ageBand = dataObj.ageBand;
          rObj.serviceRatio[dataObj.serviceId] = serviceRatio[dataObj.serviceId] * dataObj.ratio;
        });
        destStream.write(`${JSON.stringify(rObj)}\n`);
        if (index < endIndex - 1) {
          recursiveRequest(tdxApi, sourceId, destStream, index + 1, endIndex);
        } else {
          
        }
      })
      .catch((err) => {
        console.log(`get gender error ${err}`);
      });
  }

  return Wrangler;
}());
