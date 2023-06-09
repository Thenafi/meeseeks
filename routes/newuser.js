const { newUserSettingsSchema } = require("../utils/schema");

async function routes(fastify, options) {
  fastify.addSchema(newUserSettingsSchema);
  fastify.register(require("@fastify/formbody"));
  const userCollection = fastify.mongo.db.collection("users");

  fastify.get("/", async (request, reply) => {
    if (
      process.env.USER_LIMIT &&
      process.env.USER_LIMIT < (await userCollection.count())
    ) {
      return reply.view("/templates/message.ejs", {
        message: `User limit reached. Please contact admin`,
        url: "./",
        linkText: "Go back",
      });
    }
    return reply.view("/templates/newuser.ejs", {
      usernameRegex: newUserSettingsSchema.properties.username.pattern,
      passwordRegex: newUserSettingsSchema.properties.password.pattern,
    });
  });

  fastify.post("/", {
    schema: { body: { $ref: "newUserSettingsSchema" } },

    async handler(request, reply) {
      if (
        process.env.USER_LIMIT &&
        process.env.USER_LIMIT < (await userCollection.count())
      ) {
        return reply.view("/templates/message.ejs", {
          message: `User limit reached. Please contact admin`,
          url: "./",
          linkText: "Go back",
        });
      }

      const { username, password } = request.body;

      try {
        const user = await userCollection.findOne(
          {
            username: username.toLowerCase(),
          },
          { projection: { _id: -1 } }
        );
        if (user) {
          return reply.view("/templates/message.ejs", {
            message: `User ${username} already exists`,
            url: "./newuser",
            linkText: "Go back",
          });
        }

        const timeNow = new Date();
        const newUser = {
          username: username.toLowerCase(),
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
          periodicity: true, //Guarantee Periodicity
          userCreated: timeNow, // if you need cleanup users
          lastIndexUpdate: timeNow,
          lastSettingsUpdate: timeNow,
        };
        await userCollection.insertOne(newUser);
        return reply.view("/templates/message.ejs", {
          message: `User ${username} created`,
          url: "./olduser?username=" + username.toLowerCase(),
          linkText: "Start Adding URL",
        });
      } catch (error) {
        if (error.name === "MongoError" && error.code === 11000) {
          return reply.view("/templates/message.ejs", {
            message: `User ${username} already exists`,
            url: "./newuser",
            linkText: "Go back",
          });
        } else {
          console.log(err);
          return reply.view("/templates/message.ejs", {
            message: "Internal server error. Report admin",
            url: "./",
            linkText: "Go back",
          });
        }
      }
    },
  });
}

module.exports = routes;
