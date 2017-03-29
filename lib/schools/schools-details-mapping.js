module.exports = (function() {
  "use strict";
  /**
   * multiply population each areaId with ratios of each schoolsRatio
   * {                          {
   *  "areaId"  ----------------  "areaId"
   *  "gender"  ----------------  "gender"
   *  "yearGroup" --------------  "yearGroup"
   *  "persons"   multiply with   "ratios"
   * }
   *
   * @param yearGroup - array with 16 schools years
   * @param years - array with 11 years of projection getDatasetDataAsync
   *
   * requesting each year and yearGroup data from projection dataset
   *
   * requesting same yearGroup in Promise with ratio data
   *
   * multiply with each ratios with total persons each yearGroup and gender
   *
   */
  const schoolsRatios = "H1lZ4tOYie";
  const Promise = require("bluebird");
  const _ = require("lodash");
  const yearGroup = ["N1", "N2", "R", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
  const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  let projectionArray = null;
  const Wrangler = function(input, output, context, sourceId, destStream, dataArray) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    Promise.each(years, (eachYear) => {
      // iterate each year
      return Promise.each(yearGroup, (schoolYear) => {
        // iterate each yearGroup
        const pipeline = [
          {
            $match: {
              year: Number(eachYear),
              yearGroup: schoolYear,
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
          .then((response) => {
            projectionArray = response.data;
            // ratio data matches same yearGroup
            const ratioPipeline = [
              {
                $match: {
                  yearGroup: schoolYear,
                },
              },
              {
                $sort: {
                  areaId: 1,
                  gender: 1,
                },
              },
            ];
            return tdxApi.getAggregateDataAsync(schoolsRatios, JSON.stringify(ratioPipeline), null)
              .then((response) => {
                _.forEach(projectionArray, (projectionObj, index) => {
                  // iterating all projection in one year and one yearGroup
                  const persons = projectionObj.persons;
                  // find the element in ratio data with same areaId and gender
                  const ratioObj = _.find(response.data, (schoolsRatio) => {
                    return (schoolsRatio.areaId == projectionObj.areaId && schoolsRatio.gender == projectionObj.gender);
                  });
                  if (ratioObj !== undefined) {
                    _.forEach(ratioObj, (ratio, schoolId) => {
                      const rObj = {
                        areaId: projectionObj.areaId,
                        areaName: projectionObj.areaName,
                        schoolId: schoolId,
                        year: projectionObj.year,
                        yearGroup: projectionObj.year,
                        gender: projectionObj.gender,
                        persons: persons * ratio,
                      };
                      destStream.write(`${JSON.stringify(rObj)}`);
                    });
                  }
                });
                return 0;
              });
          });
      })
      .then(() => {
        destStream.end();
      });
    })
    .catch((err) => {
      output.debug(`error requesting data from tdx ${err.message}`);
    });
  };
  return Wrangler;
}());
