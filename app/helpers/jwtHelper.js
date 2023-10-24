// jwtHelper.js
const jsonwebtoken = require("jsonwebtoken");

function verifyToken(token, secret) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = {
  verifyToken,
};
