module.exports = (function() {
  "use strict";

  const factory = function(sourceType) {
    let WranglerClass;
    switch (sourceType) {
      case "serviceIdToLsoa":
        WranglerClass = require("./serviceId-to-lsoa");
        break;
      case "ons-mapping":
        WranglerClass = require("./ons-mapping");
        break;
      case "patients-mapping":
        WranglerClass = require("./ccg-to-lsoa");
        break;
      case "service-mapping":
        WranglerClass = require("./ccg-to-serviceId.js");
        break;
      case "ccg15cd-lsoa11cd":
        WranglerClass = require("./csv-direct-mapping");
        break;
      default:
        // Do nothing => return 'undefined'.
        break;
    }

    return WranglerClass;
  };
  return factory;
}());
