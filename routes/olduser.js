const { newUserSettingsSchema } = require("../utils/schema");
async function routes(fastify, options) {
  const userCollection = fastify.mongo.db.collection("users");
  fastify.addSchema(newUserSettingsSchema);

  fastify.get("/", async function (request, reply) {
    if (request.query.username) {
      const { username } = request.query;
      try {
        const userFound = await userCollection.findOne(
          {
            username: username.toLowerCase(),
          },
          {
            projection: {
              username: -1,
            },
          }
        );
        if (userFound) {
          return reply.view("/templates/olduser.ejs", {
            url: `./wish/${username}`,
            username: username,
          });
        } else {
          return reply.view("/templates/message.ejs", {
            message: `User ${username} does not exist`,
            url: `./`,
            linkText: "Go back",
          });
        }
      } catch (err) {
        console.log(err);

        return reply.view("/templates/message.ejs", {
          message: "Internal server error. Report admin",
          url: "./",
          linkText: "Go back",
        });
      }
    }
    return reply.view("/templates/olduser.ejs", {
      username: false,
      usernameRegex: newUserSettingsSchema.properties.username.pattern,
    });
  });
}

module.exports = routes;
