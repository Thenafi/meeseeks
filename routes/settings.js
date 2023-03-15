async function routes(fastify, options) {
  fastify.register(require("@fastify/formbody"));

  fastify.get("/", async (request, reply) => {
    return reply.redirect("/olduser");
  });

  //settings page
  fastify.get("/:username", async function (req, reply) {
    const { username } = req.params;
    try {
      let user = await this.level.db.get(username, { valueEncoding: "json" });
      return reply.view("/templates/settings.ejs", user);
    } catch (err) {
      return reply.view("/templates/message.ejs", {
        message: `User ${username} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }
  });

  fastify.post("/:username", async function (req, reply) {
    console.log(req.body);

    const { username } = req.params;
    const { password, linksList, ttl, randomness } = req.body;
    try {
      let user = await this.level.db.get(username, { valueEncoding: "json" });
      if (user.password === password) {
        user.links = linksList;
        user.ttl = ttl;
        user.random = randomness;
        await this.level.db.put(username, user, { valueEncoding: "json" });
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
        message: `User ${username} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }
  });
}

module.exports = routes;
