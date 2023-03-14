async function routes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    return "On User Page";
  });

  fastify.get("/foo", async function (req, reply) {
    const val = await this.level.db.get("foo");
    return val;
  });
}

module.exports = routes;
