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
fastify.register(require("fastify-markdown"), { src: true });
fastify.register(require("./routes/wish"), { prefix: "/wish" });
fastify.register(require("./routes/imex"), { prefix: "/imex" });
fastify.register(require("./routes/newuser"), { prefix: "/newuser" });
fastify.register(require("./routes/olduser"), { prefix: "/olduser" });
fastify.register(require("./routes/settings"), { prefix: "/settings" });

fastify.get("/", async function (request, reply) {
  const userCollection = fastify.mongo.db.collection("users");

  return reply.view("/templates/index.ejs", {
    userCollectionCount: await userCollection.count(),
    totalLimit: process.env.USER_LIMIT,
    contactEmail: process.env.CONTACT_EMAIL,
  });
});

fastify.get("/readme", async function (req, reply) {
  const readmePath = path.join(__dirname, "README.md");
  const parseMD = await reply.markdown(readmePath);
  const data = { content: parseMD }; // data object to pass to the EJS template

  return reply.view("/templates/markdown.ejs", data);
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
