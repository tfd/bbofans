module.exports = {
  
  clearTable: function (table, cb) {
    table.collection.remove({}, function (err) {
      cb(err);
    });
  }

};
