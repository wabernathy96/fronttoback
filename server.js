const express = require("express");
const mongoose = require("mongoose");

// Routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

// Server config
const app = express();
const PORT = process.env.PORT || 9069;

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("🦔 MongoDB Connected 🦔"))
  .catch(err => console.log(err));

// Routing
app.get("/", (req, res) => res.send("hello!"));

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(PORT, () => console.log(`🧟‍ ITS ALIIIVE ON PORT ${PORT} 🧟‍`));
