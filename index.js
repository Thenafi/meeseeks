const fastify = require("fastify")({
  logger: true,
});
require("dotenv").config();

fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
  layout: "/templates/layout.ejs",
});
fastify.register(require("@fastify/leveldb"), { name: "db" });
fastify.register(require("./routes/newuser"), { prefix: "/newuser" });
fastify.register(require("./routes/olduser"), { prefix: "/olduser" });
fastify.register(require("./routes/settings"), { prefix: "/settings" });

fastify.get("/", async (request, reply) => {
  return reply.view("/templates/index.ejs");
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
