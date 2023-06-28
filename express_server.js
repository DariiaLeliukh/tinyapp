const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const app = express();
app.use(cookieParser());
app.use(morgan("dev"));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//convert the request body from a Buffer into string
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']] || null,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']] || null,
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  res.redirect(`/urls`);
});
app.post("/urls/:id/edit", (req, res) => {
  const urlId = req.params.id;
  const newUrl = req.body.longURL
  urlDatabase[urlId] = newUrl;
  res.redirect(`/urls`);
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      searchedValue: req.params.id,
      user: users[req.cookies["user_id"]]
    };
    res.status(404).render("404", templateVars);
  }

});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  let shortURL = generateRandomString();
  while (urlDatabase.hasOwnProperty(shortURL)) {
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]] || null,
  };
  res.render("login", templateVars);
})
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email, users);

  if (!foundUser || foundUser.password !== password) {
    res.status(403).send("Invalid creadentials");
  }

  res.cookie('user_id', foundUser.id);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {

  res.clearCookie('user_id');
  res.redirect(`/login`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]] || null,
  };
  res.render("registration", templateVars);
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const foundUser = getUserByEmail(email, users);
    if (foundUser) {
      res.status(400).send(`User with email ${email} already exists.`);
    } else {
      const uniqueId = generateRandomString();
      while (users.hasOwnProperty(uniqueId)) {
        uniqueId = generateRandomString();
      }
      users[uniqueId] = {
        id: uniqueId,
        email: email,
        password: password,
      }
      res.cookie('user_id', uniqueId);
      res.redirect("/urls");
    }

  } else {
    res.status(400).send("Not enough credentials were provided. Something went wrong");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
function getUserByEmail(email, users) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
}