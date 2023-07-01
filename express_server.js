const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const app = express();
app.use(cookieParser());
app.use(morgan("dev"));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "user2RandomID"
  },
  "df458r": {
    longUrl: "http://www.youtube.com",
    userId: "userRandomID"
  },
  "sgq3y6": {
    longUrl: "http://www.youtube.com",
    userId: "user2RandomID"
  }
}

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

//convert the request body from a Buffer into string
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = {
      urls: urlsForUser(req.cookies['user_id']),
      user: users[req.cookies['user_id']] || null,
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.cookies['user_id']] || null,
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const idToDelete = req.params.id;
    /*
     logged in user can delete only his URLs.
     test: curl -X POST -i --cookie "user_id=userRandomID" localhost:8080/urls/sgq3y6/delete
    */
    if (urlDatabase[idToDelete].userId === req.cookies["user_id"]) {
      delete urlDatabase[idToDelete];
      res.redirect(`/urls`);
    } else {
      res.send("You can't delete this URL. Please, check permissions.\n");
    }
  }
});
app.post("/urls/:id/edit", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const urlToEdit = req.params.id;
    /*
     logged in user can edit only his URLs.
     test: curl -X POST -i --data "longURL=something" --cookie "user_id=userRandomID" localhost:8080/urls/df458r/edit
    */
    if (urlDatabase[urlToEdit].userId === req.cookies["user_id"]) {
      const newUrl = {
        longUrl: req.body.longURL,
        userId: req.cookies["user_id"]
      };
      urlDatabase[urlToEdit] = newUrl;
      res.redirect(`/urls`);
    } else {
      res.send("You are not allowed to edit this url.\n");
    }
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.cookies['user_id']) {
    if (urlDatabase.hasOwnProperty(req.params.id)) {
      if (urlDatabase[req.params.id].userId === req.cookies['user_id']) {
        const templateVars = {
          id: req.params.id,
          longURL: urlDatabase[req.params.id].longUrl,
          user: users[req.cookies["user_id"]]
        };
        res.render("urls_show", templateVars);
      } else {
        res.send("You are not allowed to see this page");
      }

    } else {
      const templateVars = {
        searchedValue: req.params.id,
        user: users[req.cookies["user_id"]]
      };
      res.status(404).render("404", templateVars);
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send("You are not allowed to add new URLs without being logged in.");
  } else {
    const longUrl = req.body.longURL;
    const userId = req.cookies["user_id"];
    let shortUrl = generateRandomString();
    while (urlDatabase.hasOwnProperty(shortUrl)) {
      shortUrl = generateRandomString();
    }
    urlDatabase[shortUrl] = {
      longUrl,
      userId
    };
    res.redirect(`/urls/${shortUrl}`);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]] || null,
    };
    res.render("login", templateVars);
  }

})
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email, users);

  if (!foundUser || !bcrypt.compareSync(password, foundUser.password)) {
    res.status(403).send("Invalid creadentials");
  } else {
    res.cookie('user_id', foundUser.id);
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {

  res.clearCookie('user_id');
  res.redirect(`/login`);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("Such URL does not exist in the system");
  } else {
    const longUrlToRedirect = urlDatabase[req.params.id].longUrl;
    console.log('longURL: ' + longUrlToRedirect);

    res.redirect(longUrlToRedirect);
  }
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]] || null,
    };
    res.render("registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const { email, password } = {
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

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


/*
  Generate random String with length of 6 for ID
*/
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

/*
  Get user by email if exists, otherwise return null
  Input:
    email - the associated email we are looking for
    users - object with different users
  Output
    user object. Example: 
      {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
      }
    OR null if user not found
*/
function getUserByEmail(email, users) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
}

/*
  Filter out only those URLs that are assigned to a specific user
  Input:
    id - user_id passed from the cookie from a logged n user
  Output:
    object filled with URL keys and their values OR empty object
    Example:
    {
      "b2xVn2": {
        longUrl: "http://www.lighthouselabs.ca",
        userId: "userRandomID"
      },
      "9sm5xK": {
        longUrl: "http://www.google.com",
        userId: "user2RandomID"
      },
    }
*/
function urlsForUser(id) {
  const clearedUrlsDB = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userId === id) {
      clearedUrlsDB[urlID] = urlDatabase[urlID];
    }
  }
  return clearedUrlsDB;
}