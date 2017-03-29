/* eslint-env mocha */
"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();
const _ = require("lodash");
const populationEachGP = require("../lib/people-each-gp-calculator");
const dataObj = {};
const saveObj = {};
const dataObjtotal = {};
const testExcelArray = [
  /**
   * correct input data 1-3, rowIndex is rowIndex%2 === 0
   */
  {
    "PRACTICE_CODE": "A81001",
    "lsoa1": "E01000001",
    "lsoa2": "E01000002",
    "lsoa3": "E01000003",
    "lsoa4": "W01000002",
    "lsoa5": undefined,
    "lsoa6": "",
  },
  /**
   * correct input data 1-4, rowIndex is rowIndex%2 === 1
   */
  {
    "PRACTICE_CODE": "A81001",
    "lsoa1": 10,
    "lsoa2": 30,
    "lsoa3": 10,
    "lsoa4": 20,
    "lsoa5": "",
    "lsoa6": "",
  },
];

describe("gp serviceRatios calculations testing", () => {
  describe("../lib/people-each-gp-calculator testing for gp-ratio mapping", () => {
    _.forEach(testExcelArray, (jsonObj, index) => {
      if (index === 0) {
        it("should return saveObj as an object with 3 keys", () => {
          populationEachGP(jsonObj, dataObj, saveObj, index);
          return Object.keys(saveObj).should.have.lengthOf(3);
        });
      } else if (index === 1) {
        it("should return dataObj - number of people from one LSOA to one serviceId as an object with 3 keys", () => {
          populationEachGP(jsonObj, dataObj, saveObj, index);
          return Object.keys(dataObj).should.have.lengthOf(3);
        });
      }
    });
  });
  describe("../lib/population-each-lsoa-calculator testing for gp-ratio mapping", () => {
    _.forEach(testExcelArray, (jsonObj, index) => {
      if (index === 1) {
        it("should return dataObjEach - total number of people from one LSOA as an object with 3 keys", () => {
          populationEachGP(jsonObj, dataObjtotal, saveObj, index);
          return Object.keys(dataObjtotal).should.have.lengthOf(3);
        });
      }
    });
  });
});




