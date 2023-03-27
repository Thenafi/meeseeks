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
      username: Joi.string()
        .pattern(/^[a-zA-Z0-9]{4,16}$/)
        .required(),
      password: Joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,16}$/)
        .required(),
    });

    // Validate the request body
    const { error } = schema.validate(request.body);

    if (error) {
      // If validation fails, display an error message
      return reply.view("/templates/message.ejs", {
        message: "Invalid form data.",
        url: "./",
        linkText: "Go back",
      });
    }

    try {
      const userCollection = this.mongo.db.collection("users");
      const user = await userCollection.findOne({ username: username });
      if (user) {
        console.log(user);
        return reply.view("/templates/message.ejs", {
          message: `User ${username} already exists`,
          url: "./newuser",
          linkText: "Go back",
        });
      }

      const newUser = {
        username: username,
        password: await fastify.bcrypt.hash(password),
        links: [
          "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
          "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
          "https://rickandmortyapi.com/api/character/avatar/3.jpeg",
          `https://rickandmortyapi.com/api/character/avatar/${Math.floor(
            Math.random() * 800
          )}.jpeg`,
        ],
        lastIndex: 0,
        ttl: 0,
        random: true,
      };
      await userCollection.insertOne(newUser);
      return reply.view("/templates/message.ejs", {
        message: `User ${username} created`,
        url: "./olduser",
        linkText: "Start Adding URL",
      });
    } catch (err) {
      console.log(err);
      return reply.view("/templates/message.ejs", {
        message: "Internal server error. Report admin",
        url: "./",
        linkText: "Go back",
      });
    }
  });
}

module.exports = routes;
