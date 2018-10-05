var express = require("express");
var app = express();
var PORT = 8080; // default port 8080


app.set("view engine", "ejs")
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.use(cookieSession({
  name: 'session',
  secret: 'my secret string'
}))



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

//FUNCTION TO CHECK IF SHORT URL IS REAL
function urlExists(shortUrl) {
  for (var user in urlDatabase) {
    if (shortUrl === urlDatabase[user].shortUrl) {
      return true;
    }
  }
  return false
}

//FUNCTION TO FIND if USER OWNS URL
function findUrl(shortUrl) {
  matchingUrls = []
  for (var currentUser in urlDatabase) {
    if (shortUrl === urlDatabase[currentUser].shortUrl){
      matchingUrls.push(urlDatabase[currentUser].userID)
    }
  }
  return matchingUrls
}


//FUNCTION TO FIND IF short URL EXISTS
function findUser(shortURL) {
  matchingUrls = []
  for (var currentUser in urlDatabase) {
    if (shortURL === urlDatabase[currentUser].userID){
      matchingUrls.push(urlDatabase[currentUser])
    }
  }
  return matchingUrls
}

//CREATES A NEW URL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id]
    }
    res.render("urls_new", templateVars)
  } else {
    res.redirect("/urls/login")
  };
});

//Updates an existing Long url -- Tied to User ID now
app.put("/urls/:id/update", function (req,res) {
  if(urlDatabase[req.params.id].userID === req.session.user_id){
    urlDatabase[req.params.id].longUrl = (req.body.updateURL)
  res.redirect("/urls")
  } else {
    res.send("Do not have permission to update this url")
  }
})

//DELETES A URL FROM LIST (CHANGE TO METHOD OVERRIDE EVENTUALLY)
app.delete("/urls/:id/delete", function (req, res) {
  if(urlDatabase[req.params.id].userID === req.session.user_id){
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
  } else {
    res.send("You don't have permission to delete this")
  }
});

//LOG IN
app.post("/urls/login", function (req, res) {
  let email = req.body.email
  let emailExist = false
  let passwordExist = false
  for (var user in users) {
    if (users[user].email === email){
      emailExist = true
      if(bcrypt.compareSync((req.body.password), users[user].password)){
        passwordExist = true
        req.session.user_id = users[user].id
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

//Handles Showing Login Page
app.get("/urls/login", function (req, res){
 let templateVars = {
    user: users[req.session.user_id]
  }
  res.render("urls_login", templateVars);
});

//Logs out of website and clears the user_ID cookie
app.post("/logout", function (req, res){
  req.session = null
  console.log("YOU HAVE LOGGED OUT")
  res.redirect("/")
})

//URL Page for specific url
app.get("/urls/:id", function (req, res) {
  findUrl(req.params.id) // checks to see who owns url
  let ownUrl = false
  for (let i = 0; i < matchingUrls.length; i++) {
    if (matchingUrls[i] === req.session.user_id)
    ownUrl = true;  //check to see if user matches cookie
  }

  if (req.session.user_id == false) {
    res.send("Please log in to view urls")
  } else if (urlExists(req.params.id) === false) {
    res.send("requested short url does not exist")
  } else if (ownUrl === false) {
    res.send("you do not own the url")
  } else  {
    let templateVars = {
      shortUrl: req.params.id,
      fullUrl: urlDatabase[req.params.id],
      user: users[req.session.user_id],
    }
    res.render("urls_show", templateVars);
  }
});

//List of URL Pages and Homepage
app.get("/urls", function (req, res) {
    if(req.session.user_id){
    findUser(req.session.user_id)
    let templateVars = {
      urls: matchingUrls,
      user: users[req.session.user_id],
    }
    res.render("urls_index", templateVars);
  } else {
    res.send("Please log in to see your Urls");
  }
});


//Creates a random short URL for entered url and adds to list
app.post("/urls", (req, res) => {
  let rand = generateRandomString ()
  urlDatabase[rand] = {
    shortUrl: rand,
    longUrl: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect('urls');
});

//Sends user to actual long url
app.get("/u/:shortURL", (req, res) => {
  let realUrl = urlDatabase[req.params.shortURL].longUrl
  if (realUrl.slice(0,4) === 'http'){
    res.redirect(realUrl);
  } else {
    res.redirect('http://' + realUrl)
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(res)
});



//REGISTRATION INFORMATION
app.get("/register", function (req, res){
  let templateVars = {
    user: users[req.session.user_id]
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
    req.session.user_id = rand //Assign cookie to userID
    res.redirect("/urls")
  }
})

//HOMEPAGE
app.get("/", (req, res) => {
  if(req.session.user_id){
    res.redirect("/urls")
  } else {
    res.redirect("/urls/login")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});