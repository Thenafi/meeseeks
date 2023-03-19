const joi = require("joi");
const queryString = require("querystring");
const urlCache = require("../utils/cache");
const bcrypt = require("bcrypt");
const express = require("express");
const db = require("../utils/db");
const router = express.Router();

const settingsSchema = joi.object({
  linksList: joi.array().items(joi.string().uri()).required().min(2).max(200),
  // joi ttl will be one 604800, 3600,60 ,86400 or 0
  ttl: joi.number().integer().min(0).max(604800).required(),
  randomness: joi.boolean().required(),
  password: joi
    .string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,16}$/)
    .required(),
  username: joi.string().alphanum().min(4).max(16).required(),
});

router.get("/", async (req, res) => {
  return res.redirect("/olduser");
});

//settings page
router.get("/:username", async function (req, res) {
  const { username } = req.params;

  // redirect from export page
  if (req.query.userJson) {
    const userJson = JSON.parse(req.query.userJson);

    return res.render("settings", userJson);
  }
  // basic settings
  try {
    let user = await db.get(username, { valueEncoding: "json" });
    // console.log(user);
    return res.render("settings", user);
  } catch (err) {
    // console.log(err);
    return res.render("message", {
      message: `User ${username} does not exist`,
      url: "./",
      linkText: "Go back",
    });
  }
});

router.post("/:username", async function (req, res) {
  // console.log(req.body);

  // Validate the request body
  req.body.username = req.params.username;
  const { error } = settingsSchema.validate(req.body);
  if (error) {
    console.log(error);
    // If validation fails, display an error message
    return res.render("message", {
      message: "Validation Error",
      url: "./",
      linkText: "Go back",
    });
  }

  const { username } = req.params;
  const { password, linksList, ttl, randomness } = req.body;

  try {
    let user = await db.get(username, { valueEncoding: "json" });
    if (await bcrypt.compare(password, user.password)) {
      user.links = [...new Set(linksList)];
      user.ttl = ttl;
      user.random = randomness;
      await db.put(username, user, { valueEncoding: "json" });
      urlCache.del(username);
      return res.render("message", {
        message: `User ${username} updated`,
        url: "./",
        linkText: "Go back",
      });
    } else {
      return res.render("message", {
        message: `Incorrect password`,
        url: "./",
        linkText: "Go back",
      });
    }
  } catch (err) {
    console.log(err);
    return res.render("message", {
      message: `User ${username} does not exist`,
      url: "./",
      linkText: "Go back",
    });
  }
});

module.exports = router;
