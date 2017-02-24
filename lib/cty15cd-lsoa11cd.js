module.exports = (function() {
  "use strict";
  /*
  * Generates the data mapping CTY15CD - LSOA11CD from
    CTY15CD - LAD15CD and LAD15CD - LSOA11CD

    @param ctyData - data object, CTY15CD - LAD15CD
    @param ladData = data object, LAD15CD - LSOA11CD
   */
  const fs = require("fs");
  const _ = require("lodash");
  const Promise = require("bluebird");
  const ctyData = {};
  const ladData = {};
  const ctyNames = {};
  const lsoaNames = {};
  const ctyParent = "CTY15CD";
  const ladParent = "LAD15CD";
  const lsoaChild = "LSOA11CD";
  const mkdirp = require("mkdirp").sync;

  const matchObjects = function(ctyCode, ladArray, destStream) {

  };
  const wrangler = function(jsonObj, input, output, destStream, mappingString) {
    if (jsonObj[lsoaChild]) {
      // check which dataSource it is, "LSOA11CD" existed in the raw file, LAD15CD - LSOA11CD
      const parentId = jsonObj[ladParent];
      const childId = jsonObj[lsoaChild];
      lsoaNames[childId] = jsonObj[lsoaChild.replace("CD", "NM")];
      if (!ladData[parentId]) ladData[parentId] = [];
      ladData[parentId].push(childId);
    } else {
      // CTY15CD - LAD15CD
      const parentId = jsonObj[ctyParent];
      const childId = jsonObj[ladParent];
      ctyNames[parentId] = ctyNames[parentId] || jsonObj[ctyParent.replace("CD", "NM")];
      if (!ctyData[parentId]) ctyData[parentId] = [];
      ctyData[parentId].push(childId);
    }
  };
  function checkIfPath(path) {
    return new Promise(function(resolve, reject) {
      return fs.Stat(path)
      .then((stats) => {
        resolve(stats.isFile() || stats.isDirectory());
      })
      .catch((err) => {
        if (err.code === "ENOENT") {
          resolve(false);
        } else {
          reject(err);
        }
      });
    });
  }
  function setFolderName(folderPath) {
    if (!checkIfPath(folderPath)) mkdirp(folderPath);
  }

  return wrangler;
}());
