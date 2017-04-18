module.exports = (function() {
  "use strict";
  /**
   * @param sourceId - the resourceId from tdx from input, databot inputs
   * @param populationData - the results from resquesting projectionDataset, sourceId data
   *
   * one yearGroup is made of two different agebands
   * multiply with weights
   * e.g. yearGroup 6 is made of 1/3 of 10-year-old kids and 2/3 of 11-year-old kids
   * poplets source Id is HJfA7HXtig
   * 
   */
  const Promise = require("bluebird");
  const _ = require("lodash");
  // array with 16 schools years
  const yearGroup = ["N1", "N2", "R", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
  // array with 11 years of projection getDatasetDataAsync
  const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  const schoolsRatios = "HJxVEqFY2x";
  const ccgSourceId = "S1xZmffiKx";
  const initTime = Date.now();
  const Wrangler = function(input, output, context, sourceId, destStream) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    // mappingEachCCG("E38000003", ccgSourceId, sourceId, tdxApi, destStream, output);
    tdxApi.getDistinctAsync(ccgSourceId, "parentId", {parentType: "CCG15CD", mappingType: "ons-mapping"}, null, null)
      .then((response) => {
        return Promise.each(response.data, (ccgId) => {
          output.debug(`CCG length is ${response.data.length}`);
          return mappingEachCCG(ccgId, ccgSourceId, sourceId, tdxApi, destStream, output);
        });
      })
    .then(() => {
      // destStream.end();
      console.log(`total time consuming is ${Date.now() - initTime}`);
    })
    .catch((err) => {
      output.debug(`mapping agebands to groupyear with error ${err.message}`);
    });
  };

  function mappingEachCCG(ccg, ccgSourceId, sourceId, tdxApi, destStream, output) {
    let populationData;
    let areaArray;
    const ccgPipeline = [
      {
        $match: {
          parentId: ccg,
          parentType: "CCG15CD",
          childType: "LSOA11CD",
          mappingType: "ons-mapping",
        },
      },
      {
        $group: {
          _id: null,
          childArray: {
            $push: "$childId",
          },
        },
      },
    ];
    return tdxApi.getAggregateDataAsync(ccgSourceId, JSON.stringify(ccgPipeline), null)
      .then((response) => {
        console.log(response);
        areaArray = response.data[0].childArray;
        return Promise.each(yearGroup, (schoolYear) => {
          return Promise.each(years, (eachYear) => {
            const pipeline = [
              {
                $match: {
                  yearGroup: yearGroup,
                  areaId: {
                    $in: areaArray,
                  },
                  year: eachYear,
                },
              },
              {
                $sort: {
                  areaId: 1,
                  gender: 1,
                },
              },
            ];
            return tdxApi.getAggregateDataAsync(sourceId, JSON.stringify(pipeline), null)
              .then((result) => {
                populationData = result.data;
                const filter = {
                  areaId: {
                    $in: areaArray,
                  },
                  yearGroup: schoolYear,
                };
                return tdxApi.getDatasetDataAsync(schoolsRatios, filter, null, {limit: 0});
                // return mapYearGroup(result, destStream, tdxApi);
              })
              .then((response) => {
                if (!response || response.data.length === 0) return;
                else {
                  const ratioObject = _.reduce(response.data, (result, object) => {
                    const areaId = object.areaId;
                    const gender = object.gender;
                    const yearGroup = object.yearGroup;
                    const schoolId = object.schoolId;
                    (result[areaId] || (result[areaId] = {}));
                    (result[areaId][gender] || (result[areaId][gender] = {}));
                    (result[areaId][gender][yearGroup] || (result[areaId][gender][yearGroup] = {}))[schoolId] = object.ratio;
                    // console.log(result);
                    return result;
                  }, {});
                  // console.log(ratioObject);
                  return mapYearGroup(populationData, ratioObject, destStream, tdxApi);
                }
              })
              .catch((err) => {
                output.debug(`mapYearGroup error ${err.message}`);
              });
          })
          .catch((err) => {
            output.debug(`mapping agebands to groupyear with error ${err.message}`);
          });
        });
      })
      .then(() => {
        output.debug(`finish one CCG, time is ${Date.now() - initTime}`);
      });
  }

  function mapYearGroup(populationData, ratioObject, destStream, tdxApi) {
    return Promise.each(populationData, (dataObj) => {
        // if areaId and gender matches
      const rObj = {
        areaId: dataObj.area_id,
        areaName: dataObj.area_name,
        year: Number(dataObj.year),
        yearGroup: dataObj.yearGroup,
        gender: dataObj.gender,
      };
      rObj.persons = 0
      if (ratioObject[dataObj.area_id] && ratioObject[dataObj.area_id][dataObj.gender] &&
        ratioObject[dataObj.area_id][dataObj.gender][dataObj.yearGroup]) {
        _.forEach(ratioObject[dataObj.area_id][dataObj.gender][dataObj.yearGroup], (ratio, schoolId) => {
          rObj.schoolId = schoolId;
          rObj.persons = dataObj.persons * ratio;
          destStream.write(`${JSON.stringify(rObj)}\n`);
        });
      }
    });
  }
  return Wrangler;
}());
