const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const db = new sqlite3.Database("./database.sqlite");

function initDB() {
  const schema = fs.readFileSync("./database/schema.sql", "utf8");

  db.exec(schema);
}

module.exports = { db, initDB };
