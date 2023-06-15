async function routes(fastify, options) {
  fastify.get("/", async function (request, reply) {
    linkList = [
      "https://tinyurl.com/yc3u6mbe",
      "https://cataas.com/cat",
      "https://cataas.com/cat/says/Hello%20World!",
      "https://cataas.com/cat/cute",
      "https://cataas.com/cat/says/Meow",
      "https://cataas.com/cat/says/Meow%20Meow",
      "https://source.unsplash.com/random/?car",
      "https://source.unsplash.com/random/?cat",
      "https://source.unsplash.com/random/?sky",
      "https://source.unsplash.com/random/?flower",
      "https://picsum.photos/500",
      "https://rickandmorty.chest.workers.dev/random_image",
    ];
    const random = Math.floor(Math.random() * linkList.length);

    reply.redirect(307, linkList[random]);
  });
}

module.exports = routes;
