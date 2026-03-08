const { Markup } = require("telegraf");
const { ADMIN_ID } = require("../config/config");
const {
  addSlot,
  deleteSlot,
  closeDay,
  getSlots,
} = require("../dbHelpers/schedule");
const { editPortfolio, getPortfolio } = require("../dbHelpers/portfolio");

function registerAdmin(bot) {
  // добавить слот

  console.log("регистрация админа ");
  // bot.command("/admin", (ctx) => {
  //   if (ctx.from.id !== ADMIN_ID) {
  //     console.log("зашел не админ");
  //     return;
  //   }

  //   ctx.reply(
  //     "⚙️ Админ панель",
  //     Markup.inlineKeyboard([
  //       [{ text: "➕ Добавить слот", callback_data: "admin_add_slot" }],
  //       [{ text: "➖ Удалить слот", callback_data: "admin_delete_slot" }],
  //       [{ text: "📅 Посмотреть день", callback_data: "admin_view_day" }],
  //       [{ text: "⛔ Закрыть день", callback_data: "admin_close_day" }],
  //     ]),
  //   );
  // });

  // добавить слот

  //   bot.action("admin_add_slot", (ctx) => {
  //     adminState.set(ctx.from.id, { step: "add_slot" });

  //     ctx.reply("Введите дату и время\n\nПример:\n2026-03-20 14:00");
  //   });

  //   // удалить слот

  //   bot.action("admin_delete_slot", (ctx) => {
  //     adminState.set(ctx.from.id, { step: "delete_slot" });

  //     ctx.reply("Введите дату и время слота\n\nПример:\n2026-03-20 14:00");
  //   });

  //   // просмотр расписания

  //   bot.action("admin_view_day", (ctx) => {
  //     adminState.set(ctx.from.id, { step: "view_day" });

  //     ctx.reply("Введите дату\n\nПример:\n2026-03-20");
  //   });

  //   // закрыть день

  //   bot.action("admin_close_day", (ctx) => {
  //     adminState.set(ctx.from.id, { step: "close_day" });

  //     ctx.reply("Введите дату\n\nПример:\n2026-03-20");
  //   });

  //   // обработка текста администратора

  //   bot.on("text", async (ctx) => {
  //     if (ctx.from.id !== ADMIN_ID) return;

  //     const state = adminState.get(ctx.from.id);

  //     if (!state) return;

  //     const text = ctx.message.text;

  //     // добавить слот

  //     if (state.step === "add_slot") {
  //       const [date, time] = text.split(" ");

  //       await addSlot(date, time);

  //       ctx.reply(`✅ Слот добавлен\n${date} ${time}`);

  //       adminState.delete(ctx.from.id);
  //     }

  //     // удалить слот

  //     if (state.step === "delete_slot") {
  //       const [date, time] = text.split(" ");

  //       await deleteSlot(date, time);

  //       ctx.reply(`🗑 Слот удален\n${date} ${time}`);

  //       adminState.delete(ctx.from.id);
  //     }

  //     // посмотреть день

  //     if (state.step === "view_day") {
  //       const slots = await getSlots(text);

  //       if (!slots.length) {
  //         ctx.reply("Слоты не найдены");

  //         adminState.delete(ctx.from.id);
  //         return;
  //       }

  //       let message = `📅 Расписание ${text}\n\n`;

  //       slots.forEach((s) => {
  //         message += `${s.time} — ${s.booked ? "❌ занято" : "✅ свободно"}\n`;
  //       });

  //       ctx.reply(message, { parse_mode: "Markdown" });

  //       adminState.delete(ctx.from.id);
  //     }

  //     // закрыть день

  //     if (state.step === "close_day") {
  //       await closeDay(text);

  //       ctx.reply(`⛔ День закрыт\n${text}`);

  //       adminState.delete(ctx.from.id);
  //     }
  //   });
}

module.exports = { registerAdmin };

// const { ADMIN_ID } = require("../config/config");

// function registerAdmin(bot) {
//   bot.command("admin", (ctx) => {
//     if (ctx.from.id !== ADMIN_ID) {
//       console.log("не админ ");
//       return;
//     }

//     ctx.reply(
//       `Админ панель

// команды:

// /add_service
// /remove_service
// /view_day`,
//     );
//   });
// }

// module.exports = { registerAdmin };
