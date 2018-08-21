const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// Routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

// Server config
const app = express();
const PORT = process.env.PORT || 9069;

// DB Config
const db = require("./config/keys").mongoURI;

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Passport
app.use(passport.initialize());
require("./config/passport")(passport);

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MONGODB CONNECTED "))
  .catch(err => console.log(err));

// Routing
app.get("/", (req, res) => res.send("hello!"));

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Start Server
app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT: ${PORT} 🧟`));
