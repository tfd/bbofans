var _ = require('underscore');

_.mixin({
  /**
   * Calls context.fn with the given parameters.
   * The parameters are flattened so an array will be transformed in distinct parameters.
   *
   * @param {Function} fn - method to be called
   * @param {Object} context - context in which to execute fn
   */
  callMethod: function (fn, context) {
    var args = _.toArray(arguments);
    args = _.flatten(args);
    args = _.rest(args, 2);

    switch (args.length) {
      case 0: fn.call(context); break;
      case 1: fn.call(context, args[0]); break;
      case 2: fn.call(context, args[0], args[1]); break;
      case 3: fn.call(context, args[0], args[1], args[2]); break;
      case 4: fn.call(context, args[0], args[1], args[2], args[3]); break;
      default: fn.apply(context, args); break;
    }
  }
});

module.exports = _.callMethod;
