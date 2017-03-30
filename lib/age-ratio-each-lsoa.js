module.exports = (function() {
  "use strict";
  /**
   * @param jsonObj - each parsed json object from csv-parse
   * jsonObj is expected as
   * {
   *    PRACTICE_CODE
   *    CCG_CODE
   *    ONS_CCG_CODE
   *    TOTAL_ALL
   *    TOTAL_MALE
   *    TOTAL_FEMALE
   *    MALE_0_1
   *    MALE_1_2
   *    ... ...
   *    MALE_95+
   *    FEMALE_0_1
   *    FEMALE_1_2
   *    ... ...
   *    FEMALE_95+
   * }
   * @param femaleObj - saved dict from "ratio-each-service"
   * femaleObj[ageBand][serviceId] = value, which represents the ratio of this serviceId, and ageBand
   *
   * @param maleObj - saved dict from "ratio-each-service"
   * maleObj[ageBand][serviceId] = value, which represents the ratio of this serviceId, and ageBand
   */
  /*
  * Generates the ratio of each age_band in GP service
  *  Assume this is the same as ratio of each age_band in LSOAs
  *
  * @param thisIndex - represents current column to begin with, as one ageBand consists of 5 single ages
  * like 0-4, 5-9
  */
  const _ = require("lodash");
  // the column index in Excel file
  // the offset column in raw csv file, it reads the number of
  // people each single age and gender registered in each GP
  const populationColumn = 11;
  /* eslint max-len: ["error", 200] */
  const ageBands = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85-89", "90+"];
  // the column in raw csv file represents number of people
  // registered in each GP who is male
  const maleIndex = 9;
  // the column in raw csv file represents number of people
  // registered in each GP who is female
  const femaleIndex = 10;
  const allAgebands = ageBands.concat(ageBands);

  const Wrangler = function(jsonObj, femaleObj, maleObj) {
    // get all keys as an array of each input jsonObj
    // better for iterating afterwards with each single year population column
    // columns like MALE_0_1 ... MALE_95+
    const keyArray = Object.keys(jsonObj);
    const serviceId = jsonObj[keyArray[0]];
    let gender = null;
    _.forEach(allAgebands, (ageBand, i) => {
      let thisIndex = i * 5 + populationColumn;
      if (!femaleObj[ageBand]) {
        femaleObj[ageBand] = {};
      }
      if (!maleObj[ageBand]) {
        maleObj[ageBand] = {};
      }
      if (i > ageBands.length - 1) {
        gender = "female";
        thisIndex += 1;
      } else {
        gender = "male";
      }

      /**
       * read the total population for each gender
       */
      const totalPersons = gender === "male" ?
      Number(jsonObj[keyArray[maleIndex]]) : Number(jsonObj[keyArray[femaleIndex]]);

      _.forEach(jsonObj, (value, key) => {
        // determine if $totalPersons is zero, eliminate the zeros in later calculations
        if (value.length > 0 && totalPersons !== 0) {
          let persons = Number(jsonObj[keyArray[thisIndex]]) + Number(jsonObj[keyArray[thisIndex + 1]]) +
          Number(jsonObj[keyArray[thisIndex + 2]]) + Number(jsonObj[keyArray[thisIndex + 3]]) +
          Number(jsonObj[keyArray[thisIndex + 4]]);
          if (i === ageBands.length - 1 || i === allAgebands.length - 1) {
            persons += Number(jsonObj[keyArray[thisIndex + 5]]);
          }
          const ratio = persons / totalPersons;
          if (gender === "male") {
            maleObj[ageBand][serviceId] = ratio;
          } else if (gender === "female") {
            femaleObj[ageBand][serviceId] = ratio;
          }
        }
      });
    }); // forEach age_bands;
  };
  return Wrangler;
}());
