const urlCache = require("../utils/cache");
const { getRandomNumberExcluding } = require("../utils/helpers");

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
    const remainingTimeAfterCycle =
      (timeDiffFromSettings % ttl) - timeDiffFromLastEntry;
    if (remainingTimeAfterCycle >= 0) return false;
    return true;
  }
  const timeDiff = (timeNow - lastIndexUpdate) / 1000;
  if (ttl >= timeDiff) return false;
  return true;
};

//update cache
const updateCache = function (
  username,
  linkList,
  linkIndex,
  ttl,
  lastSettingsUpdate,
  periodicity
) {
  const timeNow = new Date();
  ttl = parseInt(ttl);

  if (ttl === 0) return;

  if (periodicity) {
    const timeDiff = (timeNow - lastSettingsUpdate) / 1000;
    const remainingTimeAfterCycle = ttl - (timeDiff % ttl);
    urlCache.set(username, linkList[linkIndex], remainingTimeAfterCycle);
  } else {
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
    const username = request.params.username.toLowerCase();
    const userCacheLink = urlCache.get(username);
    if (userCacheLink) {
      if (Boolean(process.env.NODE_ENV_DEV)) console.log("cache hit");
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

    // //testing settings.
    // // debugger;
    // user.random = false;
    // user.periodicity = true;
    // user.ttl = 20;
    // ///

    if (
      expireBrain(
        user.lastIndexUpdate,
        user.lastSettingsUpdate,
        user.ttl,
        user.periodicity
      ) === false
    ) {
      reply.redirect(307, user.links[user.lastIndex]);
      updateCache(
        username,
        user.links,
        user.lastIndex,
        user.ttl,
        user.lastSettingsUpdate,
        user.periodicity
      );
      return;
    }

    let link;
    let lastIndex;

    if (user.random) {
      lastIndex = getRandomNumberExcluding(user.lastIndex, user.links.length);
      link = user.links[lastIndex];
    } else {
      if (!user.periodicity || user.ttl === 0) {
        lastIndex = (user.lastIndex + 1) % user.links.length; // complex math done in single line. Here we just need to update the user link  if more then length of links then it will automatically start from 0
        link = user.links[lastIndex];
      } else {
        const timeNow = new Date();
        const timeDiff = (timeNow - user.lastSettingsUpdate) / 1000;
        const conversionToFrequencyUnit = (timeDiff / user.ttl) | 0;
        lastIndex = conversionToFrequencyUnit % user.links.length;
        link = user.links[lastIndex];
      }
    }

    reply.redirect(307, link);
    updateCache(
      username,
      user.links,
      lastIndex,
      user.ttl,
      user.lastSettingsUpdate,
      user.periodicity
    );

    await userCollection.updateOne(
      { username },
      { $set: { lastIndex, lastIndexUpdate: new Date() } }
    );
  });
}

module.exports = routes;
