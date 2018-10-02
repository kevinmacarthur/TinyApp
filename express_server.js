var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!, Welcome to the HomePage, There is actually nothing really here");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", function (req, res) {
  res.render("urls_show", {
    shortUrl: req.params.id,
    fullUrl: urlDatabase[req.params.id]});
});

app.get("/urls", function (req, res) {
  res.render("urls_index", { urls: urlDatabase});
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(res)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});