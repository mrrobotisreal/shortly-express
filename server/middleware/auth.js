const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  req.session = {};

};
// separate functions
// 2 functions (maybe more)

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

