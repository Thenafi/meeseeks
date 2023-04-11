const urlCache = require("../utils/cache");
const { getRandomNumberExcluding, isTimeExpired } = require("../utils/helpers");

//ttl is in seconds
async function routes(fastify, options) {
  const userCollection = fastify.mongo.db.collection("users");

  fastify.get("/", async (request, reply) => {
    return reply.view("/templates/message.ejs", {
      message: "Please add your username to the URL",
      url: "./",
      linkText: "Go back",
    });
  });

  fastify.get("/:username", async (request, reply) => {
    const username = request.params.username.toLowerCase();
    const userCacheLink = urlCache.get(username);

    if (userCacheLink) {
      reply.redirect(307, userCacheLink);
      return;
    }

    const user = await userCollection.findOne(
      { username },
      { projection: { password: 0, _id: 0 } }
    );

    if (!user) {
      return reply.view("/templates/message.ejs", {
        message: `User ${username} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }

    const ttl = parseInt(user.ttl);
    if (ttl > 0 && !isTimeExpired(ttl, user.lastIndexUpdate)) {
      reply.redirect(307, user.links[user.lastIndex]);
      urlCache.set(username, user.links[user.lastIndex], ttl);
      return;
    }

    let link;
    let lastIndex;

    if (user.random) {
      lastIndex = getRandomNumberExcluding(user.lastIndex, user.links.length);
      link = user.links[lastIndex];
    } else {
      if (!user.periodicity) {
        lastIndex = (user.lastIndex + 1) % user.links.length;
        link = user.links[lastIndex];
      }

      const timeNow = new Date();
      const timeDiff =
        timeNow.getSeconds() - user.lastSettingsUpdate.getSeconds();
      const conversionToFrequencyUnit = (timeDiff / user.ttl) | 0;
      const lastIndexPlusOne = conversionToFrequencyUnit % user.links.length;
      lastIndex = Math.max(lastIndexPlusOne - 1, 0);
      link = user.links[lastIndex];
      ttl = user.ttl - timeDiff; // remaining ttl
    }

    reply.redirect(307, link);

    await userCollection.updateOne(
      { username },
      { $set: { lastIndex, lastIndexUpdate: new Date() } }
    );

    if (ttl > 0) {
      urlCache.set(username, link, ttl);
    }
  });
}

module.exports = routes;
