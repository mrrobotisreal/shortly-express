const parseCookies = (req, res, next) => {
  req.cookies = {};
  // 2 ways to append a cookie, first get cookie on browser, check express Response docs <- that's an object (R)
  if (req.headers.cookie) {
    // let yum = req.headers.cookie.split('=');
    [...req.headers.cookie.matchAll(/(\S+)=([^\s;]+)/g)].forEach(match => {
      req.cookies[match[1]] = match[2];
    });
  }
  next();
};

module.exports = parseCookies;