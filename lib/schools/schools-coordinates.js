module.exports = (function() {
  "use strict";
  /**
   * @param jsonObj is expected as:
   *
   * {
   *    "EstablishmentNumber": "2850",
   *    "Easting": "533498",
   *    "Northing": "181201"
   * }
   *
   * convert British Easting/Northing to lat/longitude using Proj4js
   * github address is: https://github.com/proj4js/proj4js
   */

  const proj4 = require("proj4");

  const Wrangler = function(input, output, destStream, mappingString) {
    this.output = output;
    this.input = input;
    this.destStream = destStream;
    this.dataObj = {};
  };

  Wrangler.prototype.wrangler = function(jsonObj, rowIndex) {
    // estabNumber is the unique schoolId
    const estabNumber = jsonObj["URN"];
    // coordinate easting code
    const easting = jsonObj["Easting"];
    // coordinate northing code
    const northing = jsonObj["Northing"];
    const coordinates = convertor(Number(easting), Number(northing));
    // mapped object
    const rObj = {
      schoolId: estabNumber,
      coordinates: coordinates,
    };
    this.destStream.write(`${JSON.stringify(rObj)}\n`);
  };

/**
 * 
 * @param {*} utmEasting - expecting a number, UK easting
 * @param {*} utmNorthing - expecting a number, UK northing
 */
  function convertor(utmEasting, utmNorthing) {
    // referecing found through http://spatialreference.org/
    // http://spatialreference.org/ref/sr-org/6832/proj4js/
    const utm = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs";
    const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    return proj4(utm, wgs84, [utmEasting, utmNorthing]);
  }
  return Wrangler;
}());
