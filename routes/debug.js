const urlCache = require("../utils/cache");
const { getRandomNumberExcluding, isTimeExpired } = require("../utils/helpers");

Number.prototype.toHHMMSS = function () {
  var seconds = Math.floor(this),
    hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  var minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};

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
      "Running ExpireBrain timeDiffFromSettings =",
      timeDiffFromSettings
    );
    console.log(
      " Running ExpireBrain timeDiffFromLastEntry = ",
      timeDiffFromLastEntry
    );
    const remainingTimeAfterCycle =
      (timeDiffFromSettings % ttl) - timeDiffFromLastEntry;

    console.log(
      "Running ExpireBrain remainingTimeAfterCycle = Meaning the time left for the next cycle to start",
      remainingTimeAfterCycle
    );
    if (remainingTimeAfterCycle >= 0) {
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
    "Running ExpireBrain timeDiff when periodicity is false =",
    timeDiff,
    "ttl",
    ttl,
    "timeDiff < ttl",
    timeDiff < ttl
  );

  if (timeDiff <= ttl) {
    console.log("Running ExpireBrain  timeDiff < ttl and returning false");

    return false;
  }
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

  console.log(linkIndex, "----");
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

    // debugger;
    // user.random = false;
    // user.periodicity = true;
    // user.ttl = 20;

    const userCacheLink = urlCache.get(username);
    const cacheTTL = urlCache.getTtl(username);
    const finalData = {
      timeNow: new Date(),
      cacheTTL: new Date(cacheTTL),
      timeDiffBetweenNowAndCacheTTL: (
        (new Date(cacheTTL) - new Date()) /
        1000
      ).toHHMMSS(),
      userCacheLink,
    };
    const resultExpireBrain = expireBrain(
      user.lastIndexUpdate,
      user.lastSettingsUpdate,
      user.ttl,
      user.periodicity
    );

    finalData.user = user;
    finalData.expireBrain = resultExpireBrain;

    if (resultExpireBrain === false) {
      console.log("ttl was not expired");

      updateCache(
        username,
        user.links,
        user.lastIndex,
        user.ttl,
        user.lastSettingsUpdate,
        user.periodicity
      );
      console.log("updated the cache and after expireBrain returned false");
    } else {
      console.log("ttl expired and going to update the link");

      let link;
      let lastIndex;
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
            "lastSettingsUpdate",
            user.lastSettingsUpdate
          );

          //the math proof is here https://pastebin.ubuntu.com/p/cQTCY2HCnq/
          // formula ins (n-1) mod p
          // here'n' is the hour and p is the number of links
          const timeDiff = (timeNow - user.lastSettingsUpdate) / 1000;
          finalData.timeDiffFromSettings = timeDiff;

          // doing this because  the math formula only works on the  time unit and the  ttl unit is same.
          // meaning if the user preference is in hours so the calculation will be in hours
          // if the user preference is in minutes so the calculation will be in minutes
          // thats why I am converting the timeDiff to the user preference unit
          // using bitwise operator to convert to integer or 0.
          const conversionToFrequencyUnit = (timeDiff / user.ttl) | 0;
          finalData.conversionToFrequencyUnit = conversionToFrequencyUnit;

          lastIndex = conversionToFrequencyUnit % user.links.length;

          link = user.links[lastIndex];
        }
      }

      finalData.lastIndex = lastIndex;
      finalData.link = link;
      finalData.userCacheLink = userCacheLink ? userCacheLink : null;
    }

    console.log(finalData);
    reply.send(finalData);
  });
  fastify.get("/:username/kill-cache", async (request, reply) => {
    const username = request.params.username.toLowerCase();
    urlCache.del(username);
    reply.send({ message: "Cache killed" });
  });

  fastify.get("/kill-all", async (request, reply) => {
    urlCache.flushAll();
    reply.send({ message: "All Cache killed" });
  });

  fastify.get("/cache-stats", async (request, reply) => {
    const allCacheKeys = urlCache.keys();
    const cacheData = [];
    for (let i = 0; i < allCacheKeys.length; i++) {
      const element = allCacheKeys[i];
      const userCacheLink = urlCache.get(element);
      const cacheTTL = urlCache.getTtl(element);
      cacheData.push({
        key: element,
        now: new Date(),
        ttl: new Date(cacheTTL),
        value: userCacheLink,
        timeDiffBetweenNowAndCacheTTL: (
          (new Date(cacheTTL) - new Date()) /
          1000
        ).toHHMMSS(),
      });
    }
    reply.send(cacheData);
  });
}

module.exports = routes;
