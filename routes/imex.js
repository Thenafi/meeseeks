const queryString = require("querystring");

//import and export route
async function routes(fastify, options) {
  const userCollection = fastify.mongo.db.collection("users");
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
        const projection = { projection: { password: 0, _id: 0 } };
        const importedUserInDB = await userCollection.findOne(
          {
            username: importedUser.toLowerCase(),
          },
          projection
        );
        const exportedUserInDB = await userCollection.findOne(
          {
            username: exportedUser.toLowerCase(),
          },
          projection
        );

        // check users exists
        if (!importedUserInDB || !exportedUserInDB) {
          return reply.view("/templates/message.ejs", {
            message: `User ${importedUser}  or ${exportedUser}  does not exist`,
            url: "./",
            linkText: "Go back",
          });
        }
        // validate both users are not the same
        if (importedUserInDB.username === exportedUserInDB.username) {
          return reply.view("/templates/message.ejs", {
            message: `User ${importedUser}  and ${exportedUser}  are the same`,
            url: "./",
            linkText: "Go back",
          });
        }

        // the main import process by simply exchanging the username of the imported user with the exported user so the data is imported to the exported user
        importedUserInDB.username = exportedUserInDB.username;
        const query = queryString.stringify({
          userJson: JSON.stringify(importedUserInDB),
        });

        reply.redirect(`/settings/${exportedUser}?${query}`);
      } catch (err) {
        console.log(err);
        return reply.view("/templates/message.ejs", {
          message: `Internal server error. Report admin`,
          url: "./",
          linkText: "Go back",
        });
      }
    } else {
      return reply.view("/templates/message.ejs", {
        message: `Both users must be filled`,
        url: "./",
        linkText: "Go back",
      });
    }
  });
}
module.exports = routes;
