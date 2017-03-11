module.exports = (function() {
  "use strict";
  const populationEachGP = require("./people-each-gp-calculator");
  const populationTotalEachLsoa = require("./population-each-lsoa-calculator");
  const _ = require("lodash");

  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
    this.objectOftotal = {};
    this.objectOfEach = {};
    this.ArrayOfeachArea = [];
    this.saveObject = {};
    this.gender = null;
  };


  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    /* eslint max-len: ["error", 150] */
    if (jsonObj[Object.keys(jsonObj)[2]].indexOf("Patients") !== -1 && this.gender === null) {
      this.gender = jsonObj[Object.keys(jsonObj)[2]].slice(0, jsonObj[Object.keys(jsonObj)[2]].indexOf("Patients") - 1);
    }
    populationEachGP(jsonObj, this.objectOfEach, this.saveObject, Wrangler.prototype.setGender, this.gender, rowIndex);
    populationTotalEachLsoa(jsonObj, this.objectOftotal, this.saveObject, this.gender, rowIndex);
  };

  Wrangler.prototype.finish = function() {
    this.output.debug("gender is %s", this.gender);
    Promise.all(_.map(this.objectOfEach, (value, key) => {
      const totalPeople = this.objectOftotal[key];
      const rObj = {
        "area_id": key,
        "ageBand": "All",
        "gender": this.gender,
        "ratioType": "genderRatio",
        "serviceId": "All",
        "ratio": 0,
        "serviceRatio": {},
      };
      _.forEach(value, (persons, serviceId) => {
        rObj.serviceRatio[serviceId] = Number(persons) / Number(totalPeople);
      });
      return this.destStream.write(`${JSON.stringify(rObj)}\n`);
    }));
  };

  return Wrangler;
}());
