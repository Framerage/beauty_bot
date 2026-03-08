// require("dotenv").config();
// const { initDB } = require("./database/db");
// const { startBot } = require("./bot/bot");

// async function start() {
//   await initDB();
//   startBot();
// }

// start();

const { Telegraf } = require("telegraf");

const { BOT_TOKEN } = require("./config/config");

const { initDB } = require("./database/db");

const { registerHandlers } = require("./bot/handlers");
const { registerAdmin } = require("./bot/admin");

const bot = new Telegraf(BOT_TOKEN);

// bot.command({
//   command: "start",
//   description: "Запуск бота",
// });
initDB();

registerHandlers(bot);
// registerAdmin(bot);

bot.telegram.setMyCommands([
  { command: "start", description: "Запуск бота" },
  { command: "admin", description: "Админская панель" },
]);

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
