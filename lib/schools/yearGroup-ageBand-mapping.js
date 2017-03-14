module.exports = (function() {
  "use strict";
  const Promise = require("bluebird");
  const _ = require("lodash");
  const yearGroup = ["N1", "N2", "R", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
  const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  const Wrangler = function(input, output, context, sourceId, destStream, dataArray) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);

    Promise.each(yearGroup, (schoolYear) => {
      const ages = [];
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
              year: 1,
              age_band: 1,
            },
          },
        ];
        return tdxApi.getAggregateDataAsync(sourceId, JSON.stringify(pipeline), null)
          .then((result) => {
            _.forEach(result.data, (dataObj) => {
              dataObj.yearGroup = schoolYear;
              if (dataObj.age_band === ages[0]) {
                dataObj.persons = 2 / 3 * dataObj.persons;
              } else {
                dataObj.persons = 1 / 3 * dataObj.persons;
              }
            });
            return result.data;
          })
          .then((result) => {
            return mapYearGroup(result, destStream);
          });
      })
      .catch((err) => {
        output.debug(`mapping agebands to groupyear with error ${err.message}`);
      });
    })
    .then(() => {
      destStream.end();
    })
    .catch((err) => {
      output.debug(`mapping agebands to groupyear with error ${err.message}`);
    });
  };

  function mapYearGroup(dataArray, destStream) {
    let year = null;
    let persons = 0;
    let dataArrays = [];
    _.forEach(dataArray, (dataObj) => {
      if (dataObj.year === year) {
        const rObj = {
          area_id: dataObj.area_id,
          area_name: dataObj.area_name,
          year: year,
          yearGroup: dataObj.yearGroup,
          gender: dataObj.gender,
        };
        rObj.persons = persons + dataObj.persons;
        dataArrays.push(rObj);
        destStream.write(`${(JSON.stringify(rObj))}\n`);
      } else {
        year = dataObj.year;
        persons += dataObj.persons;
      }
    });
    console.log("length is ");
    console.log(dataArrays.length);
    return 0;
  }
  return Wrangler;
}());
