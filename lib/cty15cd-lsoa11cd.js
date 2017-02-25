module.exports = (function() {
  "use strict";
  /*
  * Generates the data mapping CTY15CD - LSOA11CD from
    CTY15CD - LAD15CD and LAD15CD - LSOA11CD

    @param ctyData - data object, CTY15CD - LAD15CD
    @param ladData = data object, LAD15CD - LSOA11CD
   */
  const _ = require("lodash");
  const Promise = require("bluebird");
  const ctyParent = "CTY15CD";
  const lsoaChild = "LSOA11CD";

  const writeToFile = function(dataArray, destStream, output) {
    return Promise.all(_.map(dataArray, (data) => {
      return destStream.write(`${JSON.stringify(data)}\n`);
    }))
    .then((result) => {
      return {result};
    })
    .catch((err) => {
      output.debug("write ti file error %s", err);
    });
  };
  const matchObjects = function(ctyArray, ladArray, output) {
    output.debug("ladData length %d", ladArray.length);
    output.debug("ladData length %d", ctyArray.length);
    const dataArray = [];
    _.forEach(ctyArray, (ctyObj) => {
      let lsoaArray;
      const rObj = {
        parentId: ctyObj._id.parentId,
        parentType: ctyParent,
        parentName: ctyObj._id.parentName,
        childType: lsoaChild,
      };
      _.forEach(ctyObj.ladArray, (ladCode) => {
        lsoaArray = _.find(ladArray, (o) => { return o._id === ladCode; }).lsoaArray;
      });
      _.forEach(lsoaArray, (lsoaObj) => {
        rObj.childId = lsoaObj.childId;
        rObj.childName = lsoaObj.childName;
        dataArray.push(rObj);
      });
    });
    return dataArray;
  };

  const wrangler = function(input, output, context, source, destStream) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    let ctyData = null;
    const ctyPipeline = [
      {
        $match: {
          parentType: "CTY15CD",
          childType: "LAD15CD",
        },
      },
      {
        $group: {
          _id: {parentId: "$parentId", parentName: "$parentName"},
          ladArray: {$push: "$childId"},
        },
      },
    ];
    const ladPipeline = [
      {
        $match: {
          parentType: "LAD15CD",
          childType: "LSOA11CD",
        },
      },
      {
        $group: {
          _id: "$parentId",
          lsoaArray: {$push: {childId: "$childId", childName: "$childName"}},
        },
      },
    ];
    return tdxApi.getAggregateDataAsync(source, JSON.stringify(ctyPipeline), null)
      .then((ctyDataArray) => {
        ctyData = ctyDataArray.data;
        output.debug("ctydata length is %d", ctyData.length);
        return tdxApi.getAggregateDataAsync(source, JSON.stringify(ladPipeline), null);
      })
      .then((ladDataArray) => {
        output.debug("laddata length is %d", ladDataArray.data.length);
        return matchObjects(ctyData, ladDataArray.data, output);
      })
      .then((dataArray) => {
        output.debug("data length is %d", dataArray.length);
        // return dataArray;
        return writeToFile(dataArray, destStream, output);
      })
      .then((result) => {})
      .catch((err) => {
        output.debug({error: `error ${JSON.stringify(err)} requesting dataset from Tdx`});
      });
  };
  return wrangler;
}());
