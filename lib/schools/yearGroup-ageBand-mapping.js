module.exports = (function() {
  "use strict";
  /**
   * @param yearGroup - array with 16 schools years
   * @param years - array with 11 years of projection getDatasetDataAsync
   *
   * one yearGroup is made of two different agebands
   * multiply with weights
   * e.g. yearGroup 6 is made of 1/3 of 10-year-old kids and 2/3 of 11-year-old kids
   *
   * iterating all yearGroup and years
   */
  const Promise = require("bluebird");
  const _ = require("lodash");
  const yearGroup = ["N1", "N2", "R", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
  const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  const schoolsRatios = "H1lZ4tOYie";
  const initTime = Date.now();
  const Wrangler = function(input, output, context, sourceId, destStream, dataArray) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    Promise.each(yearGroup, (schoolYear) => {
      const ages = [];
      // for yearGroup N1, N2, R
      if (schoolYear === "N1") {
        ages.push("2");
        ages.push("3");
      } else if (schoolYear === "N2") {
        ages.push("3");
        ages.push("4");
      } else if (schoolYear === "R") {
        ages.push("4");
        ages.push("5");
      } else {
        // for other yearGroups
        const ageToSchool = Number(schoolYear) + 4;
        ages.push(ageToSchool.toString());
        ages.push((ageToSchool + 1).toString());
      }
      // pipeline have to match each year
      return Promise.each(years, (eachYear) => {
        const pipeline = [
          {
            $match: {
              age_band: {
                $in: ages,
              },
              year: eachYear,
            },
          },
          {
            $sort: {
              area_id: 1,
              gender: 1,
            },
          },
        ];
        return tdxApi.getAggregateDataAsync(sourceId, JSON.stringify(pipeline), null)
          .then((result) => {
            // multiply with weights
            _.forEach(result.data, (dataObj) => {
              dataObj.yearGroup = schoolYear;
              if (dataObj.age_band === ages[0]) {
                dataObj.persons = 2 / 3 * dataObj.persons;
              } else {
                dataObj.persons = 1 / 3 * dataObj.persons;
              }
            });
            // two element in resulted data need sum up to one
            return result.data;
          })
          .then((result) => {
            // todo the matching and sumup
            return mapYearGroup(result, destStream, tdxApi);
          });
      })
      .catch((err) => {
        output.debug(`mapping agebands to groupyear with error ${err.message}`);
      });
    })
    .then(() => {
      destStream.end();
      console.log(`total time consuming is ${Date.now() - initTime}`);
    })
    .catch((err) => {
      output.debug(`mapping agebands to groupyear with error ${err.message}`);
    });
  };

  function mapYearGroup(dataArray, destStream, tdxApi) {
    let areaId = null;
    let persons = 0;
    let gender = null;
    // const yearGroup = dataArray[0].yearGroup;
    // const pipeline = [
    //   {
    //     $match: {
    //       yearGroup: yearGroup,
    //     },
    //   },
    //   {
    //     $sort: {
    //       areaId: 1,
    //       gender: 1,
    //     },
    //   },
    // ];
    // return tdxApi.getAggregateDataAsync(schoolsRatios, JSON.stringify(pipeline), null)
    //   .then((result) => {
    //     return result.data;
    //   })
    //   .then((response) => {
    //     _.forEach(dataArray, (dataObj) => {
    //       if (dataObj.area_id === areaId && dataObj.gender === gender) {
    //         persons = persons + dataObj.persons;
    //         const ratioData = _.find(response, (o) => {
    //           return (o.areaId == areaId && o.gender == gender);
    //         });
    //         if (ratioData !== undefined) {
    //           _.forEach(ratioData.ratio, (ratio, schoolId) => {
    //             const rObj = {
    //               areaId: dataObj.area_id,
    //               areaName: dataObj.area_name,
    //               schoolId: schoolId,
    //               year: Number(dataObj.year),
    //               yearGroup: dataObj.yearGroup,
    //               gender: dataObj.gender,
    //               persons: persons,
    //             };
    //             destStream.write(`${(JSON.stringify(rObj))}\n`);
    //           });
    //         }
    //         persons = 0;
    //       } else {
    //         areaId = dataObj.area_id;
    //         persons += dataObj.persons;
    //         gender = dataObj.gender;
    //       }
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(`error ${err.message} when requesting ratios data`);
    //   });
    _.forEach(dataArray, (dataObj) => {
      if (dataObj.area_id === areaId && dataObj.gender === gender) {
        // if areaId and gender matches
        const rObj = {
          areaId: dataObj.area_id,
          areaName: dataObj.area_name,
          year: Number(dataObj.year),
          yearGroup: dataObj.yearGroup,
          gender: dataObj.gender,
        };
        rObj.persons = persons + dataObj.persons;
        persons = 0;
        destStream.write(`${(JSON.stringify(rObj))}\n`);
      } else {
        // save persons to memory
        areaId = dataObj.area_id;
        persons += dataObj.persons;
        gender = dataObj.gender;
      }
    });
  }
  return Wrangler;
}());
