const joi = require("joi");
const queryString = require("querystring");
const urlCache = require("../utils/cache");
const { convertToBoolean } = require("../utils/helpers");
async function routes(fastify, options) {
  const userCollection = fastify.mongo.db.collection("users");
  fastify.register(require("@fastify/formbody"));

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

  fastify.get("/", async (request, reply) => {
    return reply.redirect("/olduser");
  });

  //settings page
  fastify.get("/:username", async function (req, reply) {
    const { username } = req.params;

    // redirect from export page
    if (req.query.userJson) {
      const userJson = JSON.parse(req.query.userJson);
      return reply.view("/templates/settings.ejs", userJson);
    }
    // basic settings
    try {
      const user = await userCollection.findOne(
        { username: username },
        {
          projection: { password: 0, _id: 0 },
        }
      );
      console.log(user);
      if (user) {
        return reply.view("/templates/settings.ejs", user);
      } else {
        return reply.view("/templates/message.ejs", {
          message: `User ${username} does not exist`,
          url: "./",
          linkText: "Go back",
        });
      }
    } catch (err) {
      console.log(err);

      return reply.view("/templates/message.ejs", {
        message: `Server error. Report to admin`,
        url: "./",
        linkText: "Go back",
      });
    }
  });

  fastify.post("/:username", async function (req, reply) {
    // Validate the request body
    req.body.username = req.params.username;
    const { error } = settingsSchema.validate(req.body);
    if (error) {
      console.log(error);
      // If validation fails, display an error message
      return reply.view("/templates/message.ejs", {
        message: "Validation Error",
        url: "./",
        linkText: "Go back",
      });
    }

    const { username } = req.params;
    const { password, linksList, ttl, randomness } = req.body;

    try {
      const user = await userCollection.findOne({ username: username });
      if (!user) {
        return reply.view("/templates/message.ejs", {
          message: `User ${username} does not exist`,
          url: "./",
          linkText: "Go back",
        });
      }

      if (await fastify.bcrypt.compare(password, user.password)) {
        user.links = [...new Set(linksList)];
        user.ttl = parseInt(ttl);
        user.random = convertToBoolean(randomness);
        await userCollection.updateOne({ username: username }, { $set: user });

        urlCache.del(username);
        return reply.view("/templates/message.ejs", {
          message: `User ${username} updated`,
          url: "./",
          linkText: "Go back",
        });
      } else {
        return reply.view("/templates/message.ejs", {
          message: `Incorrect password`,
          url: "./",
          linkText: "Go back",
        });
      }
    } catch (err) {
      console.log(err);
      return reply.view("/templates/message.ejs", {
        message: `Server error. Report to admin`,
        url: "./",
        linkText: "Go back",
      });
    }
  });
}

module.exports = routes;
