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
      case "age-ratio":
        WranglerClass = require("./age-ratio-each-lsoa");
        break;
      case "gp-ratio":
        WranglerClass = require("./gp-ratio");
        break;
      default:
        // Do nothing => return 'undefined'.
        break;
    }

    return WranglerClass;
  };
  return factory;
}());
