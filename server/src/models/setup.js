/* jshint -W097 */
"use strict";

/*
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Setup Schema
 */

var SetupSchema = new Schema({
  emailTexts: [{
    type : {type: String, required: 'Type cannot be blank', unique: true, trim: true},
    title: {type: String, required: 'Title cannot be blank', trim: true},
    text : {type: String, required: 'Text cannot be blank', trim: true}
  }],
  rules     : {
    promote: [
      {
        numTournaments: {type: Number, default: 10},
        field         : {type: String, trim: true, default: 'averageScore'},
        minValue      : {type: Number, default: 50.0}
      }
    ],
    demote : [
      {
        notPlayedForMonths: {type: Number, default: 3}
      },
      {
        numTournaments: {type: Number, default: 1},
        field         : {type: String, trim: true, default: 'awards'},
        minValue      : {type: Number, default: 0}
      }
    ]
  },
  createdAt : {type: Date, default: Date.now}
});

module.exports = mongoose.model('Setup', SetupSchema);
