const express = require("express");
const router = express.Router();
const queryString = require("querystring");
const urlCache = require("../utils/cache");

const helpers = require("../utils/helpers");

router.get("/", async (request, response) => {
  return response.render("message", {
    message: "Please add your username to the url",
    url: "./",
    linkText: "Go back",
  });
});

router.get("/:username", async (request, response) => {
  const username = request.params.username;
  const userCacheLink = urlCache.get(username);

  if (userCacheLink !== undefined) {
    console.log("In cache");
    response.redirect(307, userCacheLink);
  } else {
    console.log("Not in cache");

    let link;
    const user = await request.app.get("db").get(username).value();
    if (helpers.convertToBoolean(user.random) === true) {
      // get a random number in between 0 and the length of the links array
      const randomIndex = getRandomNumberExcluding(
        user.lastIndex,
        user.links.length
      );
      // get the link from the links array
      link = user.links[randomIndex];
      response.redirect(307, link);
      user.lastIndex = randomIndex;
      await request.app.get("db").set(username, user).write();
    } else {
      console.log("Not random", user.lastIndex);

      // get the next link from the links array
      user.lastIndex++;
      console.log(user.lastIndex);
      if (user.lastIndex >= user.links.length) {
        user.lastIndex = 0;
      }
      link = user.links[user.lastIndex];
      response.redirect(307, link);

      await request.app.get("db").set(username, user).write();
    }
    if (parseInt(user.ttl) > 0) {
      console.log("Caching", user.ttl);
      urlCache.set(username, link, parseInt(user.ttl));
    }
  }
  return;
});

module.exports = router;
