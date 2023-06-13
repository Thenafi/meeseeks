const urlCache = require("../utils/cache");
const { getRandomNumberExcluding, isTimeExpired } = require("../utils/helpers");
const expireBrain = function (
  lastIndexUpdate,
  lastSettingsUpdate,
  ttl,
  periodicity
) {
  const timeNow = new Date();
  ttl = parseInt(ttl);

  if (ttl === 0) return true; // ttl is 0 meaning instant redirect and we don't need to check anything else  and redirect function should work the same as others with ttl > 0

  if (periodicity) {
    const timeDiffFromSettings = (timeNow - lastSettingsUpdate) / 1000;
    const timeDiffFromLastEntry = (timeNow - lastIndexUpdate) / 1000;
    console.log("timeDiffFromSettings", timeDiffFromSettings);
    console.log("timeDiffFromLastEntry", timeDiffFromLastEntry);
    const remainingTimeAfterCycle =
      (timeDiffFromSettings % ttl) - timeDiffFromLastEntry;
    console.log("remainingTimeAfterCycle", remainingTimeAfterCycle);
    if (remainingTimeAfterCycle > 0) return false;
    return true;
  }
  const timeDiff = (timeNow - lastIndexUpdate) / 1000;
  if (timeDiff < ttl) return false;
  return true;
};

const updateCache = function (
  username,
  linkList,
  linkIndex,
  ttl,
  lastIndexUpdate,
  lastSettingsUpdate,
  ttl,
  periodicity
) {
  const timeNow = new Date();
  ttl = parseInt(ttl);

  if (ttl === 0) return;

  if (periodicity) {
    const timeDiff = (timeNow - lastSettingsUpdate) / 1000;
    const remainingTimeAfterCycle = ttl - (timeDiff % ttl);
    urlCache.set(username, linkList[linkIndex], remainingTimeAfterCycle);
  }
  const timeDiff = (timeNow - lastIndexUpdate) / 1000;
  urlCache.set(username, linkList[linkIndex], ttl - timeDiff);
};
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
    let ttl = parseInt(user.ttl);
    if (
      expireBrain(
        user.lastIndexUpdate,
        user.lastSettingsUpdate,
        user.ttl,
        user.periodicity
      ) === false
    ) {
      console.log("ttl expired");
      console.log("userCacheLink", userCacheLink);
      console.log(user);
      updateCache(
        username,
        user.links,
        user.lastIndex,
        user.ttl,
        user.lastIndexUpdate,
        user.lastSettingsUpdate,
        user.ttl,
        user.periodicity
      );
      return;
    }

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
      finalData.timeDiffFromSettings = timeDiff;
      const conversionToFrequencyUnit = (timeDiff / user.ttl) | 0;
      finalData.conversionToFrequencyUnit = conversionToFrequencyUnit;
      const lastIndexPlusOne = conversionToFrequencyUnit % user.links.length;
      finalData.lastIndexPlusOne = lastIndexPlusOne;
      lastIndex = Math.max(lastIndexPlusOne - 1, 0);
      link = user.links[lastIndex];
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

  fastify.get("/:username/cache", async (request, reply) => {
    const username = request.params.username.toLowerCase();
    const userCacheLink = urlCache.get(username);
    const cacheTTL = urlCache.getTtl(username);
    console.log(
      "cacheTTL",
      new Date(cacheTTL),
      new Date(),
      (new Date(cacheTTL) - new Date()) / 1000
    );
  });
}

module.exports = routes;
