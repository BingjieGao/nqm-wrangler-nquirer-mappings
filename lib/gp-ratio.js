module.exports = (function() {
  "use strict";
  const _ = require("lodash");
  const Wrangler = function(input, output, context, source, destStream) {
    const tdxApi = Promise.promisifyAll(context.tdxApi);
    let genderData = null;
    const genderPipeline = [
      {
        $match: {
          ratioType: "genderRatio",
        },
      },
    ];

    return tdxApi.getAggregateDataAsync(source, JSON.stringify(genderPipeline), null)
      .then((result) => {
        genderData = result;
        return Promise.all(_.map(result.data, (dataObj) => {
          return tdxApi.getAggregateDataAsync(source, JSON.stringify(agePipeline), null);
        }))
        .then(())
      })
      .then(())
  };

  return Wrangler;
}());