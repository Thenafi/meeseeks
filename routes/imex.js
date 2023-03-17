const queryString = require("querystring");

//import and export route
async function routes(fastify, options) {
  fastify.register(require("@fastify/formbody"));

  fastify.get("/", async (request, reply) => {
    return reply.view("/templates/imex.ejs");
  });

  fastify.post("/", async function (request, reply) {
    const { importedUser, exportedUser } = request.body;

    // validate both input exists
    if (importedUser && exportedUser) {
      // validate both use exists in the database
      try {
        const importedUserInDB = await this.level.db.get(importedUser, {
          valueEncoding: "json",
        });
        const exportedUserInDB = await this.level.db.get(exportedUser, {
          valueEncoding: "json",
        });

        delete importedUserInDB.password;
        importedUserInDB.username = exportedUserInDB.username;
        console.log(importedUserInDB);
        const query = queryString.stringify({
          userJson: JSON.stringify(importedUserInDB),
        });

        reply.redirect(`/settings/${exportedUser}?${query}`);
      } catch (err) {
        console.log(err);
        return reply.view("/templates/message.ejs", {
          message: `User ${importedUser}  or ${exportedUser}  does not exist`,
          url: "./",
          linkText: "Go back",
        });
      }
    }
  });
}
module.exports = routes;
