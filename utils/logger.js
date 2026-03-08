const fs = require("fs");
const path = require("path");
const { db } = require("../database/db");

const logFile = path.join(__dirname, "../backend.log");

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;

  fs.appendFileSync(logFile, line);
}
const tables = ["booking", "slots", "portfolio"];
function dumpDatabase() {
  tables.forEach((table) => {
    db.all(`SELECT * FROM ${table}`, (err, rows) => {
      if (err) {
        log("DB ERROR: " + err.message);
        return;
      }

      log("=== BOOKINGS BACKLOG ===");

      rows.forEach((row) => {
        log(`${table}: ` + JSON.stringify(row));
      });
    });
  });
}
function getLog() {
  if (!fs.existsSync(logFile)) return "пусто";

  return fs.readFileSync(logFile, "utf8");
}

module.exports = {
  log,
  getLog,
  dumpDatabase,
};
