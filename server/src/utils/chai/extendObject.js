/* jshint -W097 */
"use strict";

/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var extendObject = {};

/*!
 * Flag utility
 */

extendObject.flag = require('./flag');

/*!
 * Function name
 */

extendObject.getName = require('./getName');

/*!
 * add Property
 */

extendObject.addProperty = require('./addProperty');

/*!
 * add Method
 */

extendObject.addMethod = require('./addMethod');

module.exports = extendObject;
