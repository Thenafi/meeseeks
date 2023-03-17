const joi = require("joi");
const urlCache = require("../utils/cache");

async function routes(fastify, options) {
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
    try {
      let user = await this.level.db.get(username, { valueEncoding: "json" });
      // console.log(user);
      return reply.view("/templates/settings.ejs", user);
    } catch (err) {
      // console.log(err);
      return reply.view("/templates/message.ejs", {
        message: `User ${username} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }
  });

  fastify.post("/:username", async function (req, reply) {
    // console.log(req.body);

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
      let user = await this.level.db.get(username, { valueEncoding: "json" });
      if (fastify.bcrypt.compareSync(password, user.password)) {
        user.links = [...new Set(linksList)];
        user.ttl = ttl;
        user.random = randomness;
        await this.level.db.put(username, user, { valueEncoding: "json" });
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
        message: `User ${username} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }
  });
}

module.exports = routes;
