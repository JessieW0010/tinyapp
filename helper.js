const bcrypt = require("bcrypt");

//returns true if email already exists in database
function getUserByEmail(email, database) {
  for (let user in database) {
    if (database[user].email == email) {
      return database[user].id;
    }
  }
}

//check password
function checkPassword(email, password, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return bcrypt.compareSync(password, users[user].password);
    }
  }
  return false;
}

//check if link belongs to user
function isUsersLink(object, id) {
  let returned = {};
  for (let obj in object) {
    if (object[obj].userID == id) {
      returned[obj] = object[obj];
    }
  }
  return returned;
}

//function returns a string of 6 alphanumeric characters
function generateRandomString() {
  var rString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 0; i < 6; i++) {
    result += rString[Math.floor(Math.random() * rString.length)]
  }
  return result;
}

module.exports = {getUserByEmail, checkPassword, isUsersLink, generateRandomString}