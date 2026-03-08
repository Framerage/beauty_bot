// const { Telegraf, Markup } = require("telegraf");
// const { buildCalendar } = require("./calendar");
// const { setState, getState, clearState } = require("../utils/fsm");
// const { db } = require("../database/db");
// const cron = require("node-cron");
// const { registerHandlers } = require("./handlers");
// const { registerAdmin } = require("./admin");
// const { BOT_TOKEN, ADMIN_ID } = require("../config/config");

// const bot = new Telegraf(BOT_TOKEN);
// // const ADMIN_ID = process.env.ADMIN_ID;
// registerHandlers(bot);
// registerAdmin(bot); // ← подключаем админ панель
// console.log("admin ", ADMIN_ID);
// function startBot() {
//   bot.start((ctx) => {
//     ctx.reply(
//       "Добро пожаловать 💄",
//       Markup.inlineKeyboard([
//         [{ text: "📅 Записаться", callback_data: "booking" }],
//         [{ text: "💰 Прайсы", callback_data: "prices" }],
//         [{ text: "📷 Портфолио", callback_data: "portfolio" }],
//       ]),
//     );
//   });

//   bot.action("booking", async (ctx) => {
//     ctx.reply("Выберите дату:", Markup.inlineKeyboard(buildCalendar()));
//   });

//   bot.action(/date_(.+)/, async (ctx) => {
//     const date = ctx.match[1];

//     db.all(
//       `SELECT * FROM slots WHERE date = ? AND booked = 0`,
//       [date],
//       (err, rows) => {
//         const buttons = rows.map((slot) => [
//           {
//             text: slot.time,
//             callback_data: `slot_${date}_${slot.time}`,
//           },
//         ]);

//         ctx.reply("Выберите время:", Markup.inlineKeyboard(buttons));
//       },
//     );
//   });

//   bot.action(/slot_(.+)_(.+)/, (ctx) => {
//     const date = ctx.match[1];
//     const time = ctx.match[2];

//     setState(ctx.from.id, {
//       step: "name",
//       date,
//       time,
//     });

//     ctx.reply("Введите ваше имя");
//   });

//   bot.on("text", (ctx) => {
//     const userState = getState(ctx.from.id);
//     if (!userState) return;

//     if (userState.step === "name") {
//       userState.name = ctx.message.text;
//       userState.step = "phone";

//       setState(ctx.from.id, userState);

//       ctx.reply("Введите номер телефона или @username");

//       return;
//     }

//     if (userState.step === "phone") {
//       userState.phone = ctx.message.text;

//       saveBooking(ctx, userState);

//       clearState(ctx.from.id);
//     }
//   });

//   async function saveBooking(ctx, data) {
//     const userId = ctx.from.id;

//     db.get(`SELECT * FROM bookings WHERE user_id = ?`, [userId], (err, row) => {
//       /* client rules
// проверяем чтобы пользователь не записался более одного раза
// */

//       if (row) {
//         ctx.reply("У вас уже есть запись. Сначала отмените её.");

//         return;
//       }

//       db.run(
//         `INSERT INTO bookings(user_id,name,phone,date,time)
// VALUES(?,?,?,?,?)`,
//         [userId, data.name, data.phone, data.date, data.time],
//       );

//       db.run(`UPDATE slots SET booked = 1 WHERE date = ? AND time = ?`, [
//         data.date,
//         data.time,
//       ]);

//       ctx.reply(`✅ Вы записаны\n${data.date} ${data.time}`);

//       bot.telegram.sendMessage(
//         ADMIN_ID,
//         `Новая запись\n${data.name}\n${data.phone}\n${data.date} ${data.time}`,
//       );

//       scheduleReminder(ctx.from.id, data);
//     });
//   }

//   function scheduleReminder(userId, booking) {
//     const reminderTime = new Date(
//       new Date(`${booking.date} ${booking.time}`).getTime() -
//         6 * 60 * 60 * 1000,
//     );

//     const diff = reminderTime - Date.now();

//     if (diff > 0) {
//       setTimeout(() => {
//         bot.telegram.sendMessage(
//           userId,
//           `Напоминание 💄\nВы записаны на ${booking.date} ${booking.time}`,
//         );
//       }, diff);
//     }
//   }

//   bot.action("prices", (ctx) => {
//     db.all(`SELECT * FROM services`, (err, rows) => {
//       let text = "*Прайс*\n\n";

//       rows.forEach((s) => {
//         text += `${s.name} — ${s.price}\n`;
//       });

//       ctx.replyWithMarkdown(text);
//     });
//   });

//   bot.action("portfolio", (ctx) => {
//     db.get(`SELECT value FROM settings WHERE key = 'portfolio'`, (err, row) => {
//       ctx.reply(row?.value || "Бьюти мастер");
//     });
//   });

//   /* weekly backend log */

//   cron.schedule("0 12 * * 1", () => {
//     db.all(`SELECT * FROM bookings`, (err, rows) => {
//       bot.telegram.sendMessage(
//         ADMIN_ID,
//         "Weekly backup:\n" + JSON.stringify(rows, null, 2),
//       );
//     });
//   });

//   bot.launch();
// }

// module.exports = { startBot };
