module.exports = (function() {
  "use strict";
  /*
  * Generates the ratio of each age_band in GP service
    Assume this is the same as ratio of each age_band in LSOAs
   */
  const _ = require("lodash");
  // the column index in Excel file
  const beginIndex = 11;
  /* eslint max-len: ["error", 200] */
  const ageBands = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85-89", "90+"];
  const maleIndex = 9;
  const femaleIndex = 10;
  const allAgebands = ageBands.concat(ageBands);
  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
    this.gender = null;
  };

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    const femaleObj = {};
    const maleObj = {};
    const keyArray = Object.keys(jsonObj);
    const serviceId = jsonObj[keyArray[0]];
    _.forEach(allAgebands, (ageBand, i) => {
      let thisIndex = i * 5 + beginIndex;
      if (!femaleObj[ageBand]) {
        femaleObj[ageBand] = {};
      }
      if (!maleObj[ageBand]) {
        maleObj[ageBand] = {};
      }
      if (i > ageBands.length - 1) {
        this.gender = "female";
        thisIndex += 1;
      } else {
        this.gender = "male";
      }
      _.forEach(jsonObj, (value, key) => {
        if (value.length > 0) {
          let persons = Number(jsonObj[keyArray[thisIndex]]) + Number(jsonObj[keyArray[thisIndex + 1]]) +
          Number(jsonObj[keyArray[thisIndex + 2]]) + Number(jsonObj[keyArray[thisIndex + 3]]) +
          Number(jsonObj[keyArray[thisIndex + 4]]);
          if (i === ageBands.length - 1 || i === allAgebands.length - 1) {
            persons += Number(jsonObj[keyArray[thisIndex + 5]]);
          }
          const totalPersons = this.gender === "male" ?
          Number(jsonObj[keyArray[maleIndex]]) : Number(jsonObj[keyArray[femaleIndex]]);
          const ratio = totalPersons === 0 ? 0 : persons / totalPersons;
          if (this.gender === "male") {
            maleObj[ageBand][serviceId] = ratio;
          } else if (this.gender === "female") {
            femaleObj[ageBand][serviceId] = ratio;
          }
        }
      }); // forEach lineArray
      const rObj = {
        area_id: "All",
        ratioType: "ageRatio",
        gender: this.gender,
        ageBand: ageBand,
        serviceId: serviceId,
        ratio: this.gender === "female" ? femaleObj[ageBand][serviceId] : maleObj[ageBand][serviceId],
        serviceRatio: {},
      };
      this.destStream.write(`${JSON.stringify(rObj)}\n`);
    }); // forEach age_bands;
  };
  return Wrangler;
}());
