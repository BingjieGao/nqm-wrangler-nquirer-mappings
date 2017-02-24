module.exports = (function() {
  "use strict";

  const factory = function(sourceType) {
    let WranglerClass;
    switch (sourceType) {
      case "serviceIdToLsoa":
        WranglerClass = require("./serviceId-to-lsoa");
        break;
      case "ons-mapping-new":
        WranglerClass = require("./ons-mapping");
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
      case "ccg15cd-lsoa11cd":
        WranglerClass = require("./ccg15cd-lsoa11cd");
        break;
      default:
        // Do nothing => return 'undefined'.
        break;
    }

    return WranglerClass;
  };
  return factory;
}());
