const express = require("express");
const Tag = require("../models/tags")
const router = express.Router();

// router.get("/tags", (req, res) => {
//   Tag.find()
//     .sort({ createdAt: -1 })
//     .then((result) => {
//       res.sendStatus(200);
//       console.log("tag gotten");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });
