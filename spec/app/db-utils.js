module.exports = function (model) {
  return {
  
    clearTable: function (name, cb) {
      model[name].remove({}, function (err) {
        cb(err);
      });
    }

  };
};
