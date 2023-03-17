const urlCache = require("../utils/cache");
const helpers = require("../utils/helpers");

function getRandomNumberExcluding(excludedNumber, maxNumber) {
  let randomNumber = Math.floor(Math.random() * maxNumber);
  while (randomNumber === excludedNumber) {
    randomNumber = Math.floor(Math.random() * maxNumber);
  }
  return randomNumber;
}

async function routes(fastify, options) {
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
      console.log("In cache");
      reply.redirect(307, userCacheLink);
    } else {
      console.log("Not in cache");

      let link;
      const user = await fastify.level.db.get(username, {
        valueEncoding: "json",
      });
      if (helpers.convertToBoolean(user.random) === true) {
        // get a random number in between 0 and the length of the links array
        const randomIndex = getRandomNumberExcluding(
          user.lastIndex,
          user.links.length
        );
        // get the link from the links array
        link = user.links[randomIndex];
        reply.redirect(307, link);
        user.lastIndex = randomIndex;
        await fastify.level.db.put(username, user, {
          valueEncoding: "json",
        });
      } else {
        console.log("Not random", user.lastIndex);

        // get the next link from the links array
        user.lastIndex++;
        console.log(user.lastIndex);
        if (user.lastIndex >= user.links.length) {
          user.lastIndex = 0;
        }
        link = user.links[user.lastIndex];
        reply.redirect(307, link);

        await fastify.level.db.put(username, user, {
          valueEncoding: "json",
        });
      }
      if (parseInt(user.ttl) > 0) {
        console.log("Caching", user.ttl);
        urlCache.set(username, link, parseInt(user.ttl));
      }
    }
    return;
  });
}

module.exports = routes;
