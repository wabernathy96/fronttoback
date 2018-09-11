const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post model
const Post = require("../../models/Post");
// Profile Model
const Profile = require("../../models/Profile")

// Post Validation
const validatePostInput = require("../validation/post");

// @route       GET api/posts/tests
// @desc        Tests posts route
// @access      Public
router.get("/test", (req, res) => res.json({ msg: "POSTS ROUTE ONLINE" }));

// @route       GET api/posts
// @desc        Get all posts
// @access      Public
router.get("/",
  (req, res) => {
    Post.find()
      .sort({ date: -1 })
      .then(posts => res.json(posts))
      .catch(err => res.status(404).json({ noPost: "No posts exist in those paramaters" }));
  }
);

// @route       GET api/posts/:id
// @desc        Get one post
// @access      Public
router.get("/:id",
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => res.json(post))
      .catch(err => res.status(404).json({ noPost: "No posts exist in those paramaters" }));
  }
);

// @route       POST api/posts
// @desc        Create post
// @access      Private
router.post("/",
  passport.authenticate("jwt", { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    // Check Validation
    if (!isValid) {
      // If errors, send 400 with errors obj
      return res.status(400).json(errors);
    }

    const newPost = new Post(
      {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      }
    );

    newPost.save()
      .then(post => res.json(post))
      .catch(err => res.status(404).json(err))
  }
);

// @route       DELETE api/posts/:id
// @desc        Delete post
// @access      Private
router.delete("/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(
        profile => {
          Post.findById(req.params.id)
            .then(
              post => {
                // Check for post owner
                if (post.user.toString() != req.user.id) {
                  return res.status(401).json({ notAuthorized: "User not authorized" });
                }

                // Delete
                post
                  .remove()
                  .then(() => res.json({ success: true }))
                  .catch(() => res.status(404).json({ noPost: "No posts exist in those paramaters" }))

              }
            )
            .catch(() => res.status(404))
        }
      )
      .catch(err => res.status(404).json(err));
  }
);

// @route       POST api/posts/like/:id
// @desc        Like post
// @access      Private
router.post("/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(
        profile => {
          Post.findById(req.params.id)
            .then(
              post => {
                // If the like obj within the likes arr has a users" id, throw err
                if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                  return res.status(400).json({ previousLike: "User has already liked this post." })
                }

                // Add user id to likes arr
                post.likes.unshift({ user: req.user.id })

                post
                  .save()
                  .then(post => res.json(post))
                  .catch(() => res.status(404).json({ likeError: "Post unable to be liked at this time." }));

              }
            )
            .catch(err => res.status(404).json(err))
        }
      )
      .catch(() => res.status(401).json({ noPost: "No posts exist in those paramaters" }));
  }
);

// @route       POST api/posts/unlike/:id
// @desc        Unlike post
// @access      Private
router.post("/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(
        profile => {
          Post.findById(req.params.id)
            .then(
              post => {
                // If the like obj within the likes arr has a users" id, throw err
                if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                  return res.status(400).json({ notLiked: "User has not yet liked the post." })
                }

                // Get remove index
                const removeIndex = post.likes
                  .map(item => item.user.toString())
                  .indexOf(req.user.id);

                // Splice out of array
                post.likes.splice(removeIndex, 1);

                // Save changes
                post
                  .save()
                  .then(post => res.json(post))
                  .catch(() => res.status(400).json({ unlikeError: "Post unable to be unliked at this time." }));

              }
            )
            .catch(err => res.status(404).json(err))
        }
      )
      .catch(() => res.status(401).json({ noPost: "No posts exist in those paramaters" }));
  }
);

// @route       POST api/posts/comment/:id
// @desc        Comment on post
// @access      Private
router.post("/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);
    // Check Validation
    if (!isValid) {
      // If errors, send 400 with errors obj
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(
        post => {
          const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
          }

          // Add to comments array
          post.comments.unshift(newComment);

          // Save changes
          post
            .save()
            .then(post => res.json(post))
            .catch(() => res.status(400).json({ commentError: "Comment unable to be added at this time" }));
        }
      )
      .catch(() => res.status(401).json({ noPost: "No posts exist in those paramaters" }));
  }
);

// @route       DELETE api/posts/comment/:id/:comment_id
// @desc        Delete comment from post
// @access      Private
router.delete("/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(
        post => {
          // Check to see if comment exists
          if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({ noComment: "Comment does not exist on the post." })
          }

          // Get remove index
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

          // Splice out of array
          post.comments.splice(removeIndex, 1);

          // Save Changes
          post
            .save()
            .then(post => res.json(post))
            .catch(() => res.status(400).json({ deleteCommentError: "Comment unable to be deleted at this time." }));
        }
      )
      .catch(() => res.status(401).json({ noPost: "No posts exist in those paramaters" }));
  }
)


module.exports = router;
