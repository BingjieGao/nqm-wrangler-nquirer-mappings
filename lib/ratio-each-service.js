module.exports = (function() {
  "use strict";
  const populationEachGP = require("./people-each-gp-calculator");
  const populationTotalEachLsoa = require("./population-each-lsoa-calculator");
  const _ = require("lodash");

  const Wrangler = function(input, output, destStream) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
    this.objectOftotal = {};
    this.objectOfEach = {};
    this.ArrayOfeachArea = [];
    this.saveObject = {};
    this.gender = null;
  };

  Wrangler.prototype.wrangler = function(jsonObj, mappingString, rowIndex) {
    /* eslint max-len: ["error", 150] */
    populationEachGP(jsonObj, this.objectOfEach, this.saveObject, this.gender, rowIndex);
    populationTotalEachLsoa(jsonObj, this.objectOftotal, this.saveObject, this.gender, rowIndex);
  };

  Wrangler.prototype.finish = function() {
    _.forEach(this.objectOfEach, (value, key) => {
      const totalPeople = this.objectOftotal[key];
      const rObj = {
        "area_id": key,
        "gender": this.gender,
        "ratios": {},
      };
      _.forEach(value, (persons, serviceId) => {
        rObj["ratios"][serviceId] = Number(persons) / Number(totalPeople);
      });
      this.destStream.write(`${JSON.stringify(rObj)}\n`);
    });
  };

  return Wrangler;
}());
