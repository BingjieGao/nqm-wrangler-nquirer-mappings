module.exports = (function() {
  "use strict";
  const Wrangler = function(input, output, destStream) {
    this.input = input;
    this.output = output;
    this.destStream = destStream;
  };

  Wrangler.prototype.wrangler = function(jsonObj) {
    if (jsonObj !== undefined) {
      const parentId = jsonObj["parentId"];
      const parentType = jsonObj["parentType"];
      const childId = jsonObj["childId"];
      const childType = jsonObj["childType"];
      const mappingType = jsonObj["mappingType"] == "schoolId-lsoa11cd" ? jsonObj["mappingType"] : "schoolId-cty15cd";
      const rObj = {
        parentId: parentId,
        childId: childId,
        parentType: parentType,
        childType: childType,
        mappingType: mappingType,
      };
      this.destStream.write(`${JSON.stringify(rObj)}\n`);
    }
  };
  return Wrangler;
}());
