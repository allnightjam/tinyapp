const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

const bcrypt = require("bcryptjs");
// const password = "purple-monkey-dinosaur"; // found in the req.body object
// const hashedPassword = bcrypt.hashSync(password, 10);



function urlsForUser(user) {
  let userURLS = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === user.id) {
      userURLS[urlID] = urlDatabase[urlID];
    }
  }
  return userURLS;
}

function generateRandomString() {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * length));
    counter += 1;
  }
  return result;
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "$2a$10$xO9o0DnDc4hWZIXYPhU6V.5oufJcp7EwlA0MjPl/2wHcJfORiTXMK",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$xO9o0DnDc4hWZIXYPhU6V.5oufJcp7EwlA0MjPl/2wHcJfORiTXMK",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.get("/urls", (req, res) => {
  // console.log(req.cookies["user_id"])
  // console.log(users);
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("Please Log In Or Register");
  }
  const urls = urlsForUser(user);
  // console.log("cookies: ", req.cookies);
  let templateVars = { urls: urls, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if  (!user) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("Please Log In Or Register");
  }
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(403).send("URL Not Found");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  if (!urlDatabase[urlID].longURL) {
    return res.send("URL Does Not Exist");
  }
  const longURL = urlDatabase[urlID].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id/delete", (req,res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("You do not have permission");
  }
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req,res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("You do not have permission");
  }
  const urlID = req.params.id;
  res.redirect(`/urls/${urlID}`);
});

app.get("/login", (req,res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user: false };
  res.render("login", templateVars);
  // res.redirect("/urls");
});

app.get("/register", (req,res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { user: false };
  res.render("register", templateVars);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send("Only Logged In Members Can Shorten URLS");
  }
  let longURL = req.body.longURL;
  let userID = req.cookies.user_id;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/edit", (req,res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("You do not have permission");
  }
  const urlID = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[urlID].longURL = newURL;
  res.redirect(`/urls/${urlID}`);
});


app.post("/login", (req,res) => {
  for (let i in users) {
    if (users[i].email === req.body.email) { 
      const passwordMatch = bcrypt.compareSync(req.body.password, users[i].password); 
      if (passwordMatch) {
        res.cookie('user_id', users[i].id);
        return res.redirect('/urls');
      }
      // if (users[i].password === passwordMatch) {
      return res.status(403).send("Email And/Or Password Invalid");
    }
  }
  return res.status(403).send("Email And/Or Password Invalid");
});

app.post("/logout", (req,res) => {
  const user = users[req.cookies["user_id"]]
  res.clearCookie('user_id', user);
  res.redirect("/login");
});

app.post("/register", (req,res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {
    id: generateRandomString(6),
    email: req.body.email,
    password: hashedPassword,
  };
  if (req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Email And/Or Password Invalid");
  }
  for (let i in users) {
    if (users[i].email === newUser.email){
      return res.status(400).send("Email Taken");
    }
  }
  users[newUser.id] = newUser;
  res.cookie("user_id", newUser.id);
  console.log(newUser.id);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req,res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("You do not have permission");
  };
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});
// "If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls." is done like this right?
// res.cookie('user_id', users[i].id)  

// LECTURE EXAMPLE
// app.post("/login", (req,res) => {
//   for (let i in users) {
//     if (users[i].email === req.body.email) {
//       if (users[i].password === req.body.pass) {
//         res.cookie('user_id', users[i].id);
//         return res.redirect('/');
//       }
//       return res.send('cannot login, wrong email/pass');
//     }
//   }
//   return res.send('cannot login, wrong email/pass');
// })

// OLD 
// app.post("/login", (req,res) => {
//   const username = req.body.username;
//   res.cookie('username', username);
//   res.redirect("/urls");
// });

// app.post("/logout", (req,res) => {
//   const username = req.body.username;
//   res.clearCookie('username', username);
//   res.redirect("/urls");
// });