module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Promise = require("bluebird");

  const dataArray = [];

  const writeToFile = function(dataArray, destStream) {
    return Promise.all(_.map(dataArray, (data) => {
      return destStream.write(`${JSON.stringify(data)}\n`);
    }))
    .then((result) => {
      return {result};
    })
    .catch((err) => {
      console.log("write to file error %s", err);
    });
  };

  const Wrangler = function(input, output, context, source, destStream) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    const genderFilter = {
      ratioType: "genderRatio",
    };
    return tdxApi.getDatasetDataCountAsync(source, genderFilter)
      .then((result) => {
        return callAllRequest(tdxApi, source, destStream, result.count);
      })
      .catch((err) => {
        output.debug(`requesting source ${source} encountered error ${err}`);
      });
  };

  function callAllRequest(tdxApi, sourceId, destStream, endIndex) {
    const genderFilter = {
      ratioType: "genderRatio",
    };
    const genderOptions = {
      sort: {
        area_id: 1,
      },
      limit: endIndex,
    };
    return tdxApi.getDatasetDataAsync(sourceId, genderFilter, null, genderOptions)
      .then((result) => {
        return Promise.each(result.data, (eachObj) => {
          const areaId = eachObj.area_id;
          const gender = eachObj.gender.toLowerCase();
          const serviceRatio = result.data[0].serviceRatio;
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
          return new Promise((resolve, reject) => {
            return tdxApi.getAggregateDataAsync(sourceId, JSON.stringify(agePipeline), null)
              .then((result) => {
                console.log("requesting age");
                console.log(result.data.length);
                const rObj = {
                  areaId: areaId,
                  gender: gender,
                  serviceRatio: {},
                };
                _.forEach(result.data, (dataObj) => {
                  rObj.ageBand = dataObj.ageBand;
                  rObj.serviceRatio[dataObj.serviceId] = serviceRatio[dataObj.serviceId] * dataObj.ratio;
                });
                console.log("dataArray length is %d", dataArray.length);
                return dataArray.push(rObj);
              })
              .then(() => {
                resolve();
              })
              .catch((err) => {
                reject(err);
              });
          })
          .then(() => {
            return writeToFile(dataArray, destStream);
          });
        })
        .then(() => {
          destStream.end();
        });
      })
      .catch((err) => {
        console.log(`catch error requesting ${err.message}`);
      });
  }

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
        dataArray.push(rObj);
        if (index < endIndex - 1) {
          recursiveRequest(tdxApi, sourceId, destStream, index + 1, endIndex);
        } else {
          return writeToFile(dataArray, destStream);
        }
      })
      .then((result) => {
        destStream.end();
      })
      .catch((err) => {
        console.log(`get gender error ${JSON.stringify(err)}`);
      });
  }

  return Wrangler;
}());
