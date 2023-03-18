const fastify = require("fastify")({
  logger: true,
});

const path = require("path");
require("dotenv").config();

fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
  layout: "/templates/layout.ejs",
});
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "static"),
  prefix: "/static/", // optional: default '/'
});
fastify.register(require("fastify-bcrypt"), {
  saltWorkFactor: 8,
});
fastify.register(require("@fastify/leveldb"), { name: "db" });
fastify.register(require("./routes/wish"), { prefix: "/wish" });
fastify.register(require("./routes/imex"), { prefix: "/imex" });
fastify.register(require("./routes/newuser"), { prefix: "/newuser" });
fastify.register(require("./routes/olduser"), { prefix: "/olduser" });
fastify.register(require("./routes/settings"), { prefix: "/settings" });

fastify.get("/", async (request, reply) => {
  return reply.view("/templates/index.ejs");
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 80, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
