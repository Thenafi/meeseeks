const urlCache = require("../utils/cache");
const { settingsSchema } = require("../utils/schema");
const { convertToBoolean } = require("../utils/helpers");

async function routes(fastify, options) {
  fastify.addSchema(settingsSchema);
  fastify.register(require("@fastify/formbody"));
  const userCollection = fastify.mongo.db.collection("users");

  fastify.get("/", async (request, reply) => {
    return reply.redirect("/olduser");
  });

  //settings page
  fastify.get("/:username", async function (req, reply) {
    const { username } = req.params;

    try {
      let user;
      if (req.query.userJson) {
        user = JSON.parse(req.query.userJson);
      } else {
        user = await userCollection.findOne(
          { username: username.toLowerCase() },
          {
            projection: { password: 0, _id: 0 },
          }
        );
      }
      if (user) {
        user.passwordRegex = settingsSchema.properties.password.pattern;
        user.maxUrlLength = settingsSchema.properties.linksList.items.maxLength;
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

  fastify.post("/:username", {
    schema: {
      body: { $ref: "settingsSchema" },
    },
    async handler(req, reply) {
      const { username } = req.params;
      const { password, linksList, ttl, randomness } = req.body;

      try {
        const user = await userCollection.findOne(
          { username: username.toLowerCase() },
          { projection: { _id: 0 } }
        );
        if (!user) {
          return reply.view("/templates/message.ejs", {
            message: `User ${username} does not exist`,
            url: "./",
            linkText: "Go back",
          });
        }

        if (await fastify.bcrypt.compare(password, user.password)) {
          let validLinksList = [...new Set(linksList)];
          if (validLinksList.length <= 1)
            validLinksList.push(
              `https://rickandmortyapi.com/api/character/avatar/${Math.floor(
                Math.random() * 800
              )}.jpeg`
            );

          user.links = validLinksList;
          user.ttl = parseInt(ttl);
          user.random = convertToBoolean(randomness);
          user.lastUpdated = new Date();
          user.lastIndex = 0;
          await userCollection.updateOne(
            { username: username.toLowerCase() },
            { $set: user }
          );

          //resetting cache data on memory
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
    },
  });
}

module.exports = routes;
