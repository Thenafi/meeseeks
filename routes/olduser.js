async function routes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    return reply.view("/templates/olduser.ejs");
  });

  //settings page
  fastify.get("/:username/settings", async function (req, reply) {
    const { username } = req.params;
    try {
      const user = await this.level.db.get(username, { valueEncoding: "json" });
      return reply.view("/templates/settings.ejs", {
        username: username,
      });
    } catch (err) {
      return reply.view("/templates/message.ejs", {
        message: `User ${username} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }
  });

  // foo for testing
  fastify.get("/foo", async function (req, reply) {
    const val = await this.level.db.get("foo");
    const val4 = await this.level.db.put("foo3", "sd");
    try {
      const val3 = await this.level.db.get("foo3");
      return val3;
    } catch (err) {
      console.log(err);
      return 1;
    }
  });

  //get all user data
  fastify.get("/:username/:password", async function (req, reply) {
    const { username, password } = req.params;
    try {
      const user = await this.level.db.get(username, { valueEncoding: "json" });

      if (user.password !== password) {
        return reply.view("/templates/message.ejs", {
          message: `Password for ${username} is incorrect`,
          url: "./olduser",
          linkText: "Go back",
        });
      }
      // console.log(user);
      return reply.send(user);
    } catch (err) {
      console.log(err);
      return reply.view("/templates/message.ejs", {
        message: `User ${username} does not exist`,
        url: "./olduser",
        linkText: "Go back",
      });
    }
  });

  fastify.get("/:username", async function (req, reply) {
    const { username } = req.params;
    try {
      const user = await this.level.db.get(username, { valueEncoding: "json" });
      return reply.view("/templates/message.ejs", {
        message: `User ${username} exists. To get all details  as json, add /password to the end of the url`,
        url: `./`,
        linkText: "Go back",
      });
    } catch (err) {
      return reply.view("/templates/message.ejs", {
        message: `User ${username} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }
  });
}

module.exports = routes;
