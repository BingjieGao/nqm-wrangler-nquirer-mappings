module.exports = (function() {
  "use strict";
  /**
   *
   * @param {*} sourceType - a string which describes the mappingType
   *
   * returns certain module accordingly
   */
  const factory = function(sourceType) {
    let WranglerClass;
    switch (sourceType) {
      case "serviceIdToLsoa":
        WranglerClass = require("./serviceId-to-lsoa");
        break;
      case "ons-mapping-new":
        WranglerClass = require("./ons-mapping-new");
        break;
      case "patients-mapping":
        WranglerClass = require("./ccg-to-lsoa");
        break;
      case "service-mapping":
        WranglerClass = require("./ccg-to-serviceId.js");
        break;
      case "ons-mapping":
        WranglerClass = require("./csv-direct-mapping");
        break;
      case "cty15cd-lsoa11cd":
        WranglerClass = require("./cty15cd-lsoa11cd");
        break;
      case "ratio-each-service":
        WranglerClass = require("./ratio-each-service");
        break;
      case "ccg-serviceId":
        WranglerClass = require("./ccg-to-serviceId");
        break;
      case "ccg16cd-lsoa11cd":
        WranglerClass = require("./ccg16cd-to-lsoa11cd");
        break;
      case "schools-ratio":
        WranglerClass = require("./schools/ratio-calculations");
        break;
      case "schools-ratio-single":
        WranglerClass = require("./schools/ratio-calculations-single-object");
        break;
      case "yearGroup-ageBand-mapping":
        WranglerClass = require("./schools/yearGroup-ageBand-mapping");
        break;
      case "edubase":
        WranglerClass = require("./schools/line-parser");
        break;
      case "estab-postcode":
        WranglerClass = require("./schools/estab-to-postcode");
        break;
      case "schools-details":
        WranglerClass = require("./schools/schools-details-mapping");
        break;
      default:
        WranglerClass = "NULL";
        // Do nothing => return 'undefined'.
        break;
    }

    return WranglerClass;
  };
  return factory;
}());
