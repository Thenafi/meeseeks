const urlCache = require("../utils/cache");
const { getRandomNumberExcluding, isTimeExpired } = require("../utils/helpers");

async function routes(fastify, options) {
  const userCollection = fastify.mongo.db.collection("users");

  fastify.get("/", async (request, reply) => {
    return reply.view("/templates/message.ejs", {
      message: "Please add your username to the url",
      url: "./",
      linkText: "Go back",
    });
  });

  fastify.get("/:username", async (request, reply) => {
    const username = request.params.username;
    const userCacheLink = urlCache.get(username);

    if (userCacheLink !== undefined) {
      reply.redirect(307, userCacheLink);
      return;
    } else {
      let link;
      let lastIndex;
      const user = await userCollection.findOne(
        { username: username.toLowerCase() },
        {
          projection: { password: 0, _id: 0 },
        }
      );

      //to check for existing user
      if (!user) {
        return reply.view("/templates/message.ejs", {
          message: `User ${username} does not exist`,
          url: "./",
          linkText: "Go back",
        });
      }

      // checking in database and setting cache
      if (
        parseInt(user.ttl) > 0 &&
        !isTimeExpired(user.ttl, user.lastIndexUpdate)
      ) {
        reply.redirect(307, user.links[user.lastIndex]);
        urlCache.set(username, user.links[user.lastIndex], parseInt(user.ttl));

        return;
      }

      // things that happen after expiry of ttl
      if (user.random === true) {
        const randomIndex = getRandomNumberExcluding(
          user.lastIndex,
          user.links.length
        );

        link = user.links[randomIndex];
        reply.redirect(307, link);
        lastIndex = randomIndex;
      } else {
        lastIndex = user.lastIndex + 1;
        if (lastIndex >= user.links.length) {
          lastIndex = 0;
        }
        link = user.links[lastIndex];
        reply.redirect(307, link);
      }

      await userCollection.updateOne(
        { username: username.toLowerCase() },
        { $set: { lastIndex: lastIndex, lastIndexUpdate: new Date() } }
      );
      if (parseInt(user.ttl) > 0) {
        urlCache.set(username, link, parseInt(user.ttl));
      }
    }
    return;
  });
}

module.exports = routes;
