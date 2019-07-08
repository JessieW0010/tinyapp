const express = require("express");
const app = express();  //initialize express

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Routing functions go here
app.get("/", function(req, res) {
  res.send("Hello! This is the homepage!");
});

// Start the server
const PORT = 8080; //default port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});