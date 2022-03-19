const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // req.session = {};
  // if (Object.keys(req.cookies).length === 0) {
  //   models.Sessions.create()
  //     .then(prom => {
  //       console.log('hash -> ', { hash });
  //       return models.Sessions.get({id: prom.insertId});
  //     })
  //     .tap(session => {
  //       res.cookie('shortlyid', sessions.hash);
  //     })
  //     .then(session => {
  //       req.session = session;
  //       next();
  //     })
  //     .catch(err => {
  //       throw err;
  //       next();
  //     });
  // } else {
  //   Promise.resolve(req.cookies.shortlyid)
  //     .then(hash => {
  //       if (!hash) {
  //         throw hash;
  //       } else {
  //         return models.Sessions.get({ hash });
  //       }
  //     })
  //     .tap(session => {
  //       if (!session) {
  //         throw session;
  //       }
  //     });
  //   next();
  // }


  Promise.resolve(req.cookies.shortlyid)
    .then(hash => {
      console.log('hash -> ', hash);
      if (!hash) {
        throw hash;
      }
      return models.Sessions.get({ hash });
    })
    .tap(session => {
      if (!session) {
        throw session;
      }
    })
    // initializes a new session
    .catch(() => {
      return models.Sessions.create()
        .then(results => {
          return models.Sessions.get({ id: results.insertId });
        })
        .tap(session => {
          res.cookie('shortlyid', session.hash);
        });
    })
    .then(session => {
      req.session = session;
      next();
    });
};


// req.session = {};
// if (Object.keys(req.cookies).length === 0) {
//   models.Sessions.create()
//     .then(prom => {
//       console.log('hash -> ', { hash });
//       return models.Sessions.get({id: prom.insertId});
//     })
//     .then(somethin => {
//       next();
//     })
//     .catch(err => {
//       next();
//     });
// } else {
//   next();
// }

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

