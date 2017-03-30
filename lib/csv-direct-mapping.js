module.exports = (function() {
  "use strict";
  /**
   * function takes input of each line as a json Object
   * direct mapping method for ons-mapping
   *
   * input csv file header contains LSOA11CD, CTY15CD...
   *
   * each header ends with "CD" is the actual code
   * each header ends with "NM" is the name of the code
   *
   * ouput schema is:
   * {
   *    parentId: parentId,
   *    childId: childId,
   *    parentType: parentType,
   *    childType: childType,
   *    parentName: parentName,
   *    childName: childName,
   *    mappingType: mappingType,
   * }
   */

  const Wrangler = function(input, output, destStream, mappingString) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
    this.typeArray = mappingString.split("-");
  };
  Wrangler.prototype.wrangler = function(jsonObj, mappingString, rowIndex) {
    const mappingType = "ons-mapping";
    // find default mapping type sources
    // ---------------------------------------------------------------
    // need to solve if mappingString for this case is empty
    // ---------------------------------------------------------------
    const parentType = this.typeArray[0].toUpperCase();
    const childType = this.typeArray[1].toUpperCase();
    const parentId = jsonObj[parentType];
    const childId = jsonObj[childType];
    const parentName = jsonObj[parentType.replace("CD", "NM")];
    const childName = jsonObj[childType.replace("CD", "NM")];
    const rObj = {
      parentId: parentId,
      childId: childId,
      parentType: parentType,
      childType: childType,
      parentName: parentName,
      childName: childName,
      mappingType: mappingType,
    };
    this.destStream.write(`${JSON.stringify(rObj)}\n`);
  };

  Wrangler.prototype.finish = function() {
    this.destStream.end();
  };

  return Wrangler;
}());
