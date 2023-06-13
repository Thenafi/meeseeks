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
    console.log(
      "Running ExpireBrain timeDiffFromSettings",
      timeDiffFromSettings
    );
    console.log(
      " Running ExpireBrain timeDiffFromLastEntry",
      timeDiffFromLastEntry
    );
    const remainingTimeAfterCycle =
      (timeDiffFromSettings % ttl) - timeDiffFromLastEntry;
    console.log(
      "Running ExpireBrain  remainingTimeAfterCycle",
      remainingTimeAfterCycle
    );
    if (remainingTimeAfterCycle > 0) {
      console.log(
        "Running ExpireBrain  remainingTimeAfterCycle > 0 and returning false"
      );
      return false;
    }
    console.log(
      "Running ExpireBrain  remainingTimeAfterCycle <= 0 and returning true"
    );
    return true;
  }
  const timeDiff = (timeNow - lastIndexUpdate) / 1000;
  console.log(
    "Running ExpireBrain  timeDiff",
    timeDiff,
    "ttl",
    ttl,
    "timeDiff < ttl",
    timeDiff < ttl
  );

  if (timeDiff < ttl) {
    console.log("Running ExpireBrain  timeDiff < ttl and returning false");

    return false;
  }
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
  console.log("Inside CacheUpdate function");
  const timeNow = new Date();
  ttl = parseInt(ttl);

  if (ttl === 0) return;

  if (periodicity) {
    const timeDiff = (timeNow - lastSettingsUpdate) / 1000;
    const remainingTimeAfterCycle = ttl - (timeDiff % ttl);
    console.log(
      "remainingTimeAfterCycle2 - going to set cache ttl time",
      remainingTimeAfterCycle
    );
    urlCache.set(username, linkList[linkIndex], remainingTimeAfterCycle);

    const cacheTTL = urlCache.getTtl(username);
    console.log(
      "cacheTTLSetup  inside update cache function is already called",
      new Date(cacheTTL),
      new Date(),
      (new Date(cacheTTL) - new Date()) / 1000
    );
  } else {
    console.log("cache update with ttl and periodicity false");
    urlCache.set(username, linkList[linkIndex], ttl);
  }
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
    debugger;
    const username = request.params.username.toLowerCase();
    const userCacheLink = urlCache.get(username);
    const cacheTTL = urlCache.getTtl(username);
    const finalData = {};
    console.log(
      "Initial cache data when function ran. cache expired time and current time and difference in seconds",
      new Date(cacheTTL),
      new Date(),
      (new Date(cacheTTL) - new Date()) / 1000
    );
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
    user.periodicity = false;
    console.log(user);
    let ttl = parseInt(user.ttl);
    if (
      expireBrain(
        user.lastIndexUpdate,
        user.lastSettingsUpdate,
        user.ttl,
        user.periodicity
      ) === false
    ) {
      console.log("ttl was not expired");

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
      console.log("updated the cache and was inside expirebrain");
    } else {
      console.log("ttl expired and going to update the link");
    }

    if (user.random) {
      lastIndex = getRandomNumberExcluding(user.lastIndex, user.links.length);
      link = user.links[lastIndex];
    } else {
      if (!user.periodicity) {
        lastIndex = (user.lastIndex + 1) % user.links.length;
        link = user.links[lastIndex];
      } else {
        const timeNow = new Date();
        console.log(
          "timeNow",
          timeNow,
          "lastsettingsudpate",
          user.lastSettingsUpdate
        );
        const timeDiff = (timeNow - user.lastSettingsUpdate) / 1000;
        finalData.timeDiffFromSettings = timeDiff;
        const conversionToFrequencyUnit = (timeDiff / user.ttl) | 0;
        finalData.conversionToFrequencyUnit = conversionToFrequencyUnit;
        const lastIndexPlusOne = conversionToFrequencyUnit % user.links.length;
        finalData.lastIndexPlusOne = lastIndexPlusOne;
        lastIndex = Math.max(lastIndexPlusOne - 1, 0);
        link = user.links[lastIndex];
      }
    }

    finalData.timeDiffFromSettings = new Date() - user.lastSettingsUpdate;
    finalData.link = link;
    finalData.lastIndex = lastIndex;
    finalData.isTTLExpired = expireBrain(
      user.lastIndexUpdate,
      user.lastSettingsUpdate,
      user.ttl,
      user.periodicity
    );
    finalData.cacheTTL = cacheTTL ? new Date(cacheTTL).toLocaleString() : null;
    finalData.ttl = ttl;
    finalData.userCacheLink = userCacheLink ? userCacheLink : null;

    console.log(finalData);
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
    reply.send(finalData);

    await userCollection.updateOne(
      { username },
      { $set: { lastIndex, lastIndexUpdate: new Date() } }
    );
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
