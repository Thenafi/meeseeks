const { newUserSettingsSchema } = require("../utils/schema");

async function routes(fastify, options) {
  fastify.addSchema(newUserSettingsSchema);
  fastify.register(require("@fastify/formbody"));
  const userCollection = fastify.mongo.db.collection("users");

  fastify.get("/", async (request, reply) => {
    return reply.view("/templates/newuser.ejs", {
      usernameRegex: newUserSettingsSchema.properties.username.pattern,
      passwordRegex: newUserSettingsSchema.properties.password.pattern,
    });
  });

  fastify.post("/", {
    schema: { body: { $ref: "newUserSettingsSchema" } },

    async handler(request, reply) {
      const { username, password } = request.body;

      try {
        const user = await userCollection.findOne({ username: username });
        if (user) {
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
    },
  });
}

module.exports = routes;
