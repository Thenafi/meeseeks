async function routes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    return "On User Page";
  });
}

module.exports = routes;
