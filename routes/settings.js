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
      const user = req.query.userJson
        ? JSON.parse(req.query.userJson)
        : await userCollection.findOne(
            { username: username.toLowerCase() },
            { projection: { password: 0, _id: 0 } }
          );

      if (user) {
        if (user.links.length <= 1)
          user.links.push(
            `https://rickandmortyapi.com/api/character/avatar/${Math.floor(
              Math.random() * 800
            )}.jpeg`
          );

        if (user.ttl < 3600) user.periodicity = false;
        else user.periodicity = user.periodicity ?? false;

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
      const { password, linksList, ttl, randomness, periodicity } = req.body;
      
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
          user.lastIndex = 0;
          user.ttl = parseInt(ttl);
          user.periodicity = periodicity
            ? convertToBoolean(periodicity)
            : false;
          user.random = convertToBoolean(randomness);
          user.lastIndexUpdate = new Date();
          user.lastSettingsUpdate = new Date();
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
