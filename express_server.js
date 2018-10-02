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
//Generates Random 6 digit Alphanumeric code
function generateRandomString() {
  let randString = ""
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++) {
    randString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
  }
  return randString
}

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

app.post("/urls", (req, res) => {
  let rand = generateRandomString ()
  urlDatabase[rand] = req.body.longURL;
  console.log(urlDatabase)
  res.send("Ok");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(res)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});