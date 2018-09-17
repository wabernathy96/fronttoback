const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");

// Route Files
const users = require("./routes/api/users");
const profiles = require("./routes/api/profiles");
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
  .then(() => console.log("MONGODB CONNECTED"))
  .catch(err => console.log(err));

// Routing
app.get("/", (req, res) => res.send("Hello World!"));

app.use("/api/users", users);
app.use("/api/profile", profiles);
app.use("/api/posts", posts);

// Serve static assets if in prod env
if (process.env.NODE_ENV === production) {
  // Set static folder
  app.use(express.static("client/build"))

  // Load index.html 
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

// Start Server
app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT: ${PORT}`));
