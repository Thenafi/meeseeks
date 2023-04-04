async function routes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    return reply.view("/templates/olduser.ejs");
  });

  //fix the function
  fastify.get("/:username", async function (req, reply) {
    const userCollection = this.mongo.db.collection("users");
    const { username } = req.params;

    try {
      const user = await userCollection.findOne({
        username: username.toLowerCase(),
      });
      if (user) {
        return reply.view("/templates/message.ejs", {
          message: `User ${username} exists. To get all details  as json, add /password to the end of the url`,
          url: `./`,
          linkText: "Go back",
        });
      } else {
        return reply.view("/templates/message.ejs", {
          message: `User ${username} does not exist`,
          url: `./`,
          linkText: "Go back",
        });
      }
    } catch (err) {
      console.log(err);

      return reply.view("/templates/message.ejs", {
        message: "Internal server error. Report admin",
        url: "./",
        linkText: "Go back",
      });
    }
  });
}

module.exports = routes;
