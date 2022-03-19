const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');
const cookies = require('./middleware/cookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookies);
//app.use(Auth);



app.get('/',
  (req, res) => {
    console.log('in req body');
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

// make sure to rerender/redirect
// log req.body
// res.render / res.redirect

app.get('/login', (req, res) => {
  // later, check if there's a cookie so I can skip past the login (<- for login not signup)
  // if (req.headers.cookie) {
  //   cookies(req, res, res.redirect);
  //   // if (req.cookies) {
  //   //   res.render('/');
  //   // }
  // }
  console.log(res);
  res.render('login');
});

app.post('/login', (req, res) => {
  models.Users.get({username: req.body.username})
    .then(pwd => {
      if (pwd && models.Users.compare(req.body.password, pwd.password, pwd.salt)) {
        // let uCookie = document.cookie = new Cookie;
        // console.log('cookie -> ', uCookie);
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    })
    .catch(err => {
      throw err;
    });
});

app.get('/signup', (req, res) => {
  let url = req.body.url;
  res.render('signup');
});

app.post('/signup', (req, res, next) => {
  models.Users.create(req.body)
    .then(data => {
      res.redirect('/');
    })
    .catch(err => {
      console.log('username already taken!');
      res.redirect('/signup');
    });
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
