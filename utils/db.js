const { Level } = require("level");
const path = require("path");

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "db");
const db = new Level(dbPath, { valueEncoding: "json" });

module.exports = db;
