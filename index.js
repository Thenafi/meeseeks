const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const port = process.env.PORT || 80;

app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use("/wish", require("./routes/wish"));
app.use("/imex", require("./routes/imex"));
app.use("/newuser", require("./routes/newuser"));
app.use("/olduser", require("./routes/olduser"));
app.use("/settings", require("./routes/settings"));

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
