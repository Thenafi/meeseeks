const Joi = require("joi");

async function routes(fastify, options) {
  fastify.register(require("@fastify/formbody"));

  fastify.get("/", async (request, reply) => {
    return reply.view("/templates/newuser.ejs");
  });

  fastify.post("/", async function (request, reply) {
    const { username, password } = request.body;

    // Define the validation schema
    const schema = Joi.object({
      username: Joi.string().alphanum().min(4).max(16).required(),
      password: Joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,16}$/)
        .required(),
    });

    // Validate the request body
    const { error } = schema.validate(request.body);

    if (error) {
      // If validation fails, display an error message
      return reply.view("/templates/message.ejs", {
        message: "Invalid form data",
        url: "./",
        linkText: "Go back",
      });
    }

    try {
      const user = await this.level.db.get(username);
      return reply.view("/templates/message.ejs", {
        message: `User ${username} already exists`,
        url: "./newuser",
        linkText: "Go back",
      });
    } catch (err) {
      const defaultUser = {
        username: username,
        password: password,
        links: [
          "https://source.unsplash.com/random/",
          "https://source.unsplash.com/random/",
        ],
        lastIndex: 0,
        ttl: 0,
        random: true,
      };

      //put the user in the database with the default values as json
      await this.level.db.put(username, defaultUser, {
        valueEncoding: "json",
      });

      return reply.view("/templates/message.ejs", {
        message: `User ${username} created`,
        url: "./olduser",
        linkText: "Start Adding",
      });
    }
  });
}

module.exports = routes;
