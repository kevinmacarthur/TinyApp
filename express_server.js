var express = require("express");
var app = express();
var PORT = 8080; // default port 8080


app.set("view engine", "ejs")
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// PLACEHOLDER DATA STRUCTURES
var urlDatabase = {
  "b2xVn2": {
    shortUrl:"b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    userID: "",
  },
  "9sm5xK": {
    shortUrl: "9sm5xK",
    longUrl: "http://www.google.com",
    userID: ""
  }
};

const users = {
  "userID": {
      "id": "randomID",
      "email": "email",
      "password": "password"
    }
  }

//Generates Random 6 digit Alphanumeric code for short url or userID
function generateRandomString() {
  let randString = ""
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++) {
    randString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
  }
  return randString
}

//FUNCTION CHECKS IF EMAIL ALREADY EXISTS IN USERS OBJECT
function emailExists(email) {
  for (var userID in users) {
    if (email === users[userID].email) {
      return true;
    }
  }
  return false
}

//FUNCTION TO POPULATE ARRAY WITH ALL URLS CONNECTED TO USER ID
function findUser(userToBeFound) {
  matchingUrls = []
  for (var currentUser in urlDatabase) {
    if (userToBeFound === urlDatabase[currentUser].userID){
      matchingUrls.push(urlDatabase[currentUser])
    }
  }
  return matchingUrls
}

//CREATES A NEW URL
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_ID"]) {
    let templateVars = {
      user: users[req.cookies["user_ID"]]
    }
    res.render("urls_new", templateVars)
  } else {
    res.redirect("/register")
  };
});

//DELETES A URL FROM LIST (CHANGE TO METHOD OVERRIDE EVENTUALLY)
app.post("/urls/:id/delete", function (req, res) {
  if(urlDatabase[req.params.id].userID === req.cookies["user_ID"]){
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
  } else {
    res.send("You don't have permission to delete this")
  }
});

//LOG IN
app.post("/urls/login", function (req, res) {
  let email = req.body.email
  let password = req.body.password  //Might get rid of this line and directly compare passwords in if statement
  console.log(password)
  let emailExist = false
  let passwordExist = false
  for (var user in users) {
    if (users[user].email === email){
      emailExist = true
      if(bcrypt.compareSync((password), users[user].password)){
        passwordExist = true
        res.cookie("user_ID", users[user].id)
        res.redirect("/urls")
      }
    }
  }
  // WHAT GETS SENT ON ERROR MESSAGES
  if (!emailExist){
    res.statusCode = 403
    res.send('Error: This account does not exist please register email')
  }
  if (!passwordExist) {
    res.statusCode = 403
    res.send('Error: Incorrect Password')
  }
})


//Handles Login Page
app.get("/urls/login", function (req, res){
 let templateVars = {
    user: users[req.cookies["user_ID"]]
  }
  res.render("urls_login", templateVars);
});

//Logs out of website and clears the user_ID cookie
app.post("/urls/logout", function (req, res){
  res.clearCookie("user_ID")
  res.redirect("/urls/login")
})

//Updates an existing Long url -- Tied to User ID now
app.post("/urls/:id/update", function (req,res) {
  if(urlDatabase[req.params.id].userID === req.cookies["user_ID"]){
    urlDatabase[req.params.id].longUrl = (req.body.updateURL)
  res.redirect("/urls")
  } else {
    res.send("Do not have permission to update this url")
  }
})

//URL Page for specific url
app.get("/urls/:id", function (req, res) {
  if(urlDatabase[req.params.id].userID === req.cookies["user_ID"]){
    let templateVars = {
      shortUrl: req.params.id,
      fullUrl: urlDatabase[req.params.id],
      user: users[req.cookies["user_ID"]],
    }
    res.render("urls_show", templateVars);
  } else{
    res.send("Please log in to see your Urls");
  }
});

//List of URL Pages and Homepage
app.get("/urls", function (req, res) {
  findUser(req.cookies["user_ID"])
  let templateVars = {
    urls: matchingUrls,
    user: users[req.cookies["user_ID"]],
  }
  res.render("urls_index", templateVars);
});


//Creates a random short URL for entered url and adds to list
app.post("/urls", (req, res) => {
  let rand = generateRandomString ()
  urlDatabase[rand] = {
    shortUrl: rand,
    longUrl: req.body.longURL,
    userID: req.cookies["user_ID"]
  }
  res.redirect('urls/' + rand);
});

//Sends user to actual long url
app.get("/u/:shortURL", (req, res) => {
  let realUrl = urlDatabase[req.params.shortURL].longUrl
  res.redirect(realUrl);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(res)
});



//REGISTRATION INFORMATION
app.get("/register", function (req, res){
  let templateVars = {
    user: users[req.cookies["UserID"]]
  }
  res.render("urls_register", templateVars);
});

app.post("/register", function (req,res){
  let email = req.body.email
  let password = req.body.password
  let hashedPassword = bcrypt.hashSync(password, 10)
  if (!email || !password) {            //Handles error if either email or password are blank
    res.statusCode = 400
    res.send('Error: Email or Password are empty')
    console.log('Status Code: ', res.statusCode)
  } else if (emailExists(email)) {       //Handles error if email already exists
    res.statusCode = 400
    res.send('Error: This email has already been registered')
    console.log('Status Code: ', res.statusCode)
  } else {
    let rand = generateRandomString ()
    users[rand] = {
      id: rand,
      email: email,
      password: hashedPassword
    }
    console.log("Current User Database" , users)
    res.cookie("user_ID", rand) //Assign cookie to userID
    res.redirect("/urls")
  }
})

//REDIRECTS HOMEPAGE TO URLS PAGE
app.get("/", (req, res) => {
  res.render("urls_home")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});