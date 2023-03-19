const Joi = require("joi");
const express = require("express");
const db = require("../utils/db");
const router = express.Router();
const bcrypt = require("bcrypt");

router.use(require("body-parser").urlencoded({ extended: true }));

router.get("/", async (req, res) => {
  return res.render("newuser");
});

router.post("/", async function (req, res) {
  const { username, password } = req.body;

  // Define the validation schema
  const schema = Joi.object({
    username: Joi.string()
      .pattern(/^[a-zA-Z0-9]{4,16}$/)
      .required(),
    password: Joi.string()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,16}$/)
      .required(),
  });

  // Validate the request body
  const { error } = schema.validate(req.body);

  if (error) {
    // If validation fails, display an error message
    return res.render("message", {
      message: "Invalid form data.",
      url: "./",
      linkText: "Go back",
    });
  }

  try {
    const user = await db.get(username);
    return res.render("message", {
      message: `User ${username} already exists`,
      url: "./newuser",
      linkText: "Go back",
    });
  } catch (err) {
    const defaultUser = {
      username: username,
      password: await bcrypt.hash(password, 8),
      links: [
        "https://source.unsplash.com/random/900x900/?sky",
        "https://source.unsplash.com/random/900x900/?car",
        "https://picsum.photos/900",
        `https://rickandmortyapi.com/api/character/avatar/${Math.floor(
          Math.random() * 800
        )}.jpeg`,
      ],
      lastIndex: 0,
      ttl: 0,
      random: true,
    };

    //put the user in the database with the default values as json
    await db.put(username, defaultUser);

    return res.render("message", {
      message: `User ${username} created`,
      url: "./olduser",
      linkText: "Start Adding URL",
    });
  }
});

module.exports = router;
