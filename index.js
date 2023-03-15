const fastify = require("fastify")({
  logger: true,
});

fastify.register(require("@fastify/leveldb"), { name: "db" });
fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
});
fastify.register(require("./routes/newuser"), { prefix: "/newuser" });
fastify.register(require("./routes/olduser"), { prefix: "/olduser" });
fastify.register(require("./routes/settings"), { prefix: "/settings" });
fastify.get("/", async (request, reply) => {
  return reply.view("/templates/index.ejs");
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
