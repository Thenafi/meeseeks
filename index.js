const fastify = require("fastify")({
  logger: true,
});
const urlCache = require("./utils/cache");
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
fastify.register(require("@fastify/mongodb"), {
  forceClose: true,
  url: process.env.MONGODB_URI,
});
fastify.register(require("fastify-mongodb-sanitizer"), {
  params: true,
  query: true,
  body: true,
});
fastify.register(require("./routes/wish"), { prefix: "/wish" });
fastify.register(require("./routes/imex"), { prefix: "/imex" });
fastify.register(require("./routes/newuser"), { prefix: "/newuser" });
fastify.register(require("./routes/olduser"), { prefix: "/olduser" });
fastify.register(require("./routes/settings"), { prefix: "/settings" });

fastify.get("/", async function (request, reply) {
  return reply.view("/templates/index.ejs");
});

fastify.get("/statsCache", async function (request, reply) {
  return reply.send(urlCache.getStats());
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 8080, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
