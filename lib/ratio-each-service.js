module.exports = (function() {
  /**
   * @param mappingstring - check the file which information it contains with different genders
   * or if file contains single age information
   * @param objectOftotalFemale
   * @param objectOftotalMale
   * saved dic represents total persons each gender
   *
   * @param objectOfEachFemale
   * @param objectOfEachMale
   * saved dic represents number of persons registered in each service, each gender,
   * objectOfEachMale[serviceId] = value
   *
   * @param saveObjectFemale
   * @param saveObjectMale
   * saved dic for reading even rowIndex of raw csv files, which contains actual areaIds
   *
   * @param femaleAgeRatio
   * @param maleAgeRatio
   * saved dic with calculated results represents proption people in each ageBand registered in one serviceId
   */
  "use strict";
  const populationEachGP = require("./people-each-gp-calculator");
  const populationTotalEachLsoa = require("./population-each-lsoa-calculator");
  const ageCalculator = require("./age-ratio-each-lsoa");
  const _ = require("lodash");

  const Wrangler = function(input, output, destStream) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
    this.objectOftotalFemale = {};
    this.objectOftotalMale = {};
    this.objectOfEachFemale = {};
    this.objectOfEachMale = {};
    this.saveObjectFemale = {};
    this.saveObjectMale = {};
    this.gender = null;
    this.femaleAgeRatio = {};
    this.maleAgeRatio = {};
    this.count = 0;
  };

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex, mappingString) {
    /* eslint max-len: ["error", 150] */
    if (mappingString === "age-ratio-each-lsoa") {
      // file contains single age information without lsoa information
      ageCalculator(jsonObj, this.femaleAgeRatio, this.maleAgeRatio);
    } else if (mappingString.indexOf("ratio-each-service") !== -1) {
      // file contains only LSOA information, no ageBands
      if (mappingString === "ratio-each-service-male") {
        // if file is described with  gender male
        // calculation for every serviceId, the number of people registered, from each LSOA
        populationEachGP(jsonObj, this.objectOfEachMale, this.saveObjectMale, rowIndex);
        // calculation for every LSOA, the total number of people
        populationTotalEachLsoa(jsonObj, this.objectOftotalMale, this.saveObjectMale, rowIndex);
      } else if (mappingString === "ratio-each-service-female") {
        // if file is described with  gender female
        populationEachGP(jsonObj, this.objectOfEachFemale, this.saveObjectFemale, rowIndex);
        populationTotalEachLsoa(jsonObj, this.objectOftotalFemale, this.saveObjectFemale, rowIndex);
      }
    } else {
      this.output.debug("Input file sources wrong please check details in README for file inputs");
    }
  };

  Wrangler.prototype.finish = function() {
    // check if all three data sources are parsed already
    this.count += 1;
    if (this.count === 3) {
      // calculations for both gender
      // female
      _.forEach(this.femaleAgeRatio, (serviceRatioObj, ageBand) => {
        _.forEach(this.objectOfEachFemale, (value, key) => {
          // make sure that no incorrect LSOA code is passed to file
          // should start with a E
          if (key.indexOf("E") !== -1 && key !== "undefined" && key !== undefined) {
            const totalPeople = this.objectOftotalFemale[key];
            let total = 0;
            const rObj = {
              "areaId": key,
              "gender": "female",
              "ageBand": ageBand,
              "serviceRatio": {},
            };
            _.forEach(value, (persons, serviceId) => {
              // the final ratio
              rObj.serviceRatio[serviceId] = Number(persons) / Number(totalPeople) * serviceRatioObj[serviceId];
              total += rObj.serviceRatio[serviceId];
            });
            _.forEach(rObj.serviceRatio, (value, serviceId) => {
              // calculation for re-normalized ratio from previous final ratio
              rObj.serviceRatio[serviceId] = value / total;
            });
            this.destStream.write(`${JSON.stringify(rObj)}\n`);
          }
        });
      });

      // same for male
      _.forEach(this.maleAgeRatio, (serviceRatioObj, ageBand) => {
        _.forEach(this.objectOfEachMale, (value, key) => {
          // make sure that no incorrect LSOA code is passed to file
          // should start with a E
          if (key.indexOf("E") !== -1 && key !== "undefined" && key !== undefined) {
            const totalPeople = this.objectOftotalMale[key];
            let total = 0;
            const rObj = {
              "areaId": key,
              "gender": "male",
              "ageBand": ageBand,
              "serviceRatio": {},
            };
            _.forEach(value, (persons, serviceId) => {
              rObj.serviceRatio[serviceId] = Number(persons) / Number(totalPeople) * serviceRatioObj[serviceId];
              total += rObj.serviceRatio[serviceId];
            });
            _.forEach(rObj.serviceRatio, (value, serviceId) => {
              rObj.serviceRatio[serviceId] = value / total;
            });
            this.destStream.write(`${JSON.stringify(rObj)}\n`);
          }
        });
      });
    }
  };

  return Wrangler;
}());
