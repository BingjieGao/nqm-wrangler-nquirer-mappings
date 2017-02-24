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
  let ctyData = null;
  const ctyParent = "CTY15CD";
  const lsoaChild = "LSOA11CD";
  const matchObjects = function(ctyArray, ladArray) {
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
    tdxApi.getAggregateDataAsync("S1xZmffiKx", JSON.stringify(ctyPipeline), null)
      .then((ctyDataArray) => {
        ctyData = ctyDataArray;
        output.debug(ctyData);
        return tdxApi.getAggregateDataAsync("S1xZmffiKx", JSON.stringify(ladPipeline), null);
      })
      .then((ladDataArray) => {
        return matchObjects(ctyData, ladDataArray);
      })
      .catch((err) => {
        output.debug({error: `error ${JSON.stringify(err)} requesting dataset from Tdx`});
      });
  };
  // function checkIfPath(path) {
  //   return new Promise(function(resolve, reject) {
  //     return fs.Stat(path)
  //     .then((stats) => {
  //       resolve(stats.isFile() || stats.isDirectory());
  //     })
  //     .catch((err) => {
  //       if (err.code === "ENOENT") {
  //         resolve(false);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  // }
  // function setFolderName(folderPath) {
  //   if (!checkIfPath(folderPath)) mkdirp(folderPath);
  // }

  return wrangler;
}());
