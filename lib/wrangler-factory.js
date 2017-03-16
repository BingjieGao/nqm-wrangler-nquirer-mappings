module.exports = (function() {
  "use strict";

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
      case "yearGroup-ageBand-mapping":
        WranglerClass = require("./schools/yearGroup-ageBand-mapping");
        break;
      // gp-calculations process, age-ratio
      case "age-ratio":
        WranglerClass = require("./age-ratio-each-lsoa.js");
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
