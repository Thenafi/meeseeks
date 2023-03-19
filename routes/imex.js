const queryString = require("querystring");
const express = require("express");
const db = require("../utils/db");
const router = express.Router();

router.use(require("body-parser").urlencoded({ extended: true }));

router.get("/", async (req, res) => {
  return res.render("imex");
});

router.post("/", async function (req, res) {
  const { importedUser, exportedUser } = req.body;

  // validate both input exists
  if (importedUser && exportedUser) {
    // validate both use exists in the database
    try {
      const importedUserInDB = await db.get(importedUser, {
        valueEncoding: "json",
      });
      const exportedUserInDB = await db.get(exportedUser, {
        valueEncoding: "json",
      });

      delete importedUserInDB.password;
      importedUserInDB.username = exportedUserInDB.username;
      console.log(importedUserInDB);
      const query = queryString.stringify({
        userJson: JSON.stringify(importedUserInDB),
      });

      res.redirect(`/settings/${exportedUser}?${query}`);
    } catch (err) {
      console.log(err);
      return res.render("message", {
        message: `User ${importedUser} or ${exportedUser} does not exist`,
        url: "./",
        linkText: "Go back",
      });
    }
  }
});

module.exports = router;
