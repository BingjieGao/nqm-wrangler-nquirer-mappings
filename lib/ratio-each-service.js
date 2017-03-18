module.exports = (function() {
  /**
   * generates gp-ratios, age-ratio is assumed to be calculated first
   */
  "use strict";
  const populationEachGP = require("./people-each-gp-calculator");
  const populationTotalEachLsoa = require("./population-each-lsoa-calculator");
  const ageCalculator = require("./age-ratio-each-lsoa");
  const _ = require("lodash");
  const Promise = require("bluebird");

  const Wrangler = function(input, output, destStream) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
    this.objectOftotalFemale = {};
    this.objectOftotalMale = {};
    this.objectOfEachFemale = {};
    this.objectOfEachMale = {};
    this.ArrayOfeachArea = [];
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
      ageCalculator(jsonObj, this.femaleAgeRatio, this.maleAgeRatio);
    } else if (mappingString.indexOf("ratio-each-service") !== -1) {
      if (mappingString === "ratio-each-service-male") {
        populationEachGP(jsonObj, this.objectOfEachMale, this.saveObjectMale, rowIndex);
        populationTotalEachLsoa(jsonObj, this.objectOftotalMale, this.saveObjectMale, rowIndex);
      } else if (mappingString === "ratio-each-service-female") {
        populationEachGP(jsonObj, this.objectOfEachFemale, this.saveObjectFemale, rowIndex);
        populationTotalEachLsoa(jsonObj, this.objectOftotalFemale, this.saveObjectFemale, rowIndex);
      }
    } else {
      this.output.debug("Input file sources wrong please check details in README for file inputs");
    }
  };

  Wrangler.prototype.finish = function() {
    this.count += 1;
    if (this.count === 3) {
      _.forEach(this.femaleAgeRatio, (serviceRatioObj, ageBand) => {
        _.forEach(this.objectOfEachFemale, (value, key) => {
          if (key.indexOf("E") !== -1 && key !== "undefined" && key !== undefined) {
            const totalPeople = this.objectOftotalFemale[key];
            let total = 0;
            const rObj = {
              "area_id": key,
              "gender": "female",
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

      _.forEach(this.maleAgeRatio, (serviceRatioObj, ageBand) => {
        _.forEach(this.objectOfEachMale, (value, key) => {
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
    //this.destStream.end();
  };

  return Wrangler;
}());
