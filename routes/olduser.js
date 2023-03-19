const bcrypt = require("bcrypt");
const express = require("express");
const db = require("../utils/db");
const router = express.Router();

router.get("/", async (req, res) => {
  return res.render("olduser");
});

//get all user data
router.get("/:username/:password", async function (req, res) {
  const { username, password } = req.params;
  try {
    const user = await db.get(username, { valueEncoding: "json" });

    if ((await bcrypt.compare(password, user.password)) === false) {
      return res.render("message", {
        message: `Password for ${username} is incorrect`,
        url: "./olduser",
        linkText: "Go back",
      });
    }
    // console.log(user);
    delete user.password;
    return res.send(user);
  } catch (err) {
    console.log(err);
    return res.render("message", {
      message: `User ${username} does not exist`,
      url: "./olduser",
      linkText: "Go back",
    });
  }
});

router.get("/:username", async function (req, res) {
  const { username } = req.params;
  try {
    const user = await db.get(username, { valueEncoding: "json" });
    return res.render("message", {
      message: `User ${username} exists. To get all details  as json, add /password to the end of the url`,
      url: `./`,
      linkText: "Go back",
    });
  } catch (err) {
    // console.log(err);

    return res.render("message", {
      message: `User ${username} does not exist`,
      url: "./",
      linkText: "Go back",
    });
  }
});

module.exports = router;
