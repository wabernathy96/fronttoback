const express = require("express");
const router = express.router();

// @route       GET api/posts/tests
// @desc        Tests posts route
// @access      Public
router.get("/test", (req, res) => res.json({ msg: "POSTS ROUTE ONLINE" }));

module.exports = router;
