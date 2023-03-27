const urlCache = require("../utils/cache");
const { getRandomNumberExcluding } = require("../utils/helpers");

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
      console.log("In cache");
      reply.redirect(307, userCacheLink);
    } else {
      console.log("Not in cache");

      let link;
      let lastIndex;
      const user = await userCollection.findOne(
        { username: username },
        {
          projection: { password: 0, _id: 0 },
        }
      );
      if (!user) {
        return reply.view("/templates/message.ejs", {
          message: `User ${username} does not exist`,
          url: "./",
          linkText: "Go back",
        });
      }

      if (user.random === true) {
        // get a random number in between 0 and the length of the links array
        const randomIndex = getRandomNumberExcluding(
          user.lastIndex,
          user.links.length
        );
        // get the link from the links array
        link = user.links[randomIndex];
        reply.redirect(307, link);
        lastIndex = randomIndex;
      } else {
        // console.log("Not random", user.lastIndex);

        // get the next link from the links array
        lastIndex = user.lastIndex + 1;
        if (lastIndex >= user.links.length) {
          lastIndex = 0;
        }
        link = user.links[lastIndex];
        reply.redirect(307, link);
      }

      await userCollection.updateOne(
        { username: username },
        { $set: { lastIndex: lastIndex } }
      );
      if (parseInt(user.ttl) > 0) {
        console.log("Caching", user.ttl);
        urlCache.set(username, link, parseInt(user.ttl));
      }
    }
    return;
  });
}

module.exports = routes;
