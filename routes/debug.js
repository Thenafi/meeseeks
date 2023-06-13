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
    const cacheTTL = urlCache.getTtl(username);
    const finalData = {};
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

    const isTTLExpired = isTimeExpired(cacheTTL, user.lastIndexUpdate);

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
      console.log(timeNow, user.lastSettingsUpdate);
      const timeDiff = (timeNow - user.lastSettingsUpdate) / 1000;
      finalData.timeDiff = timeDiff;
      const conversionToFrequencyUnit = (timeDiff / user.ttl) | 0;
      finalData.conversionToFrequencyUnit = conversionToFrequencyUnit;
      const lastIndexPlusOne = conversionToFrequencyUnit % user.links.length;
      lastIndex = Math.max(lastIndexPlusOne - 1, 0);
      link = user.links[lastIndex];
      ttl = user.ttl - Math.floor(timeDiff % user.ttl); // remaining ttl
    }

    finalData.user = user;
    finalData.link = link;
    finalData.lastIndex = lastIndex;
    finalData.isTTLExpired = isTTLExpired;
    finalData.cacheTTL = cacheTTL ? new Date(cacheTTL).toLocaleString() : null;
    finalData.ttl = ttl;
    finalData.userCacheLink = userCacheLink ? userCacheLink : null;

    console.log(finalData);
    reply.send(finalData);
  });
}

module.exports = routes;
