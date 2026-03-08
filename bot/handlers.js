// const { Markup } = require("telegraf");

// const { buildCalendar } = require("./calendar");

// const { timeKeyboard } = require("./keyboards");

// const {
//   createBooking,
//   cancelBooking,
//   getBookingByUser,
// } = require("../services/bookingService");

// function registerHandlers(bot) {
//   bot.start((ctx) => {
//     ctx.reply(
//       "Добро пожаловать",

//       Markup.inlineKeyboard([
//         [{ text: "Записаться", callback_data: "booking" }],
//         [{ text: "Прайсы", callback_data: "prices" }],
//         [{ text: "Портфолио", callback_data: "portfolio" }],
//         [{ text: "Отменить запись", callback_data: "cancel" }],
//       ]),
//     );
//   });

//   bot.action("booking", (ctx) => {
//     ctx.reply(
//       "Выберите дату",

//       Markup.inlineKeyboard(buildCalendar()),
//     );
//   });

//   bot.action(/date_(.+)/, (ctx) => {
//     const date = ctx.match[1];

//     ctx.reply(
//       `Дата ${date}

// Выберите время`,

//       Markup.inlineKeyboard(timeKeyboard(date)),
//     );
//   });

//   bot.action(/slot_(.+)_(.+)/, async (ctx) => {
//     const date = ctx.match[1];

//     const time = ctx.match[2];

//     ctx.reply(`Вы выбрали

// ${date}
// ${time}`);
//   });

//   bot.action("cancel", async (ctx) => {
//     await cancelBooking(ctx.from.id);

//     ctx.reply("Запись отменена");
//   });
// }

// module.exports = { registerHandlers };

const { Markup } = require("telegraf");

const { buildCalendar } = require("./calendar");

const { timeKeyboard } = require("./keyboards");

const { setState, getState, clearState } = require("../utils/fsm");

const {
  createBooking,
  cancelBooking,
  getBookingByUser,
} = require("../dbHelpers/booking");

const { getPortfolio, editPortfolio } = require("../dbHelpers/portfolio");
const { ADMIN_ID } = require("../config/config");
const { getLog, dumpDatabase } = require("../utils/logger");
const adminState = new Map();

const clientKeyboard = [
  [{ text: "📅 Записаться", callback_data: "booking" }],
  [{ text: "💰 Прайсы", callback_data: "prices" }],
  [{ text: "📷 Портфолио", callback_data: "portfolio" }],
  [{ text: "⛔ Отменить запись", callback_data: "cancel" }],
];

const adminKeyboard = [
  //   [{ text: "➕ Добавить слот", callback_data: "admin_add_slot" }],
  //   [{ text: "➖ Удалить слот", callback_data: "admin_delete_slot" }],
  //   [{ text: "📅 Посмотреть день", callback_data: "admin_view_day" }],
  //   [{ text: "⛔ Закрыть день", callback_data: "admin_close_day" }],
  [{ text: " Редактировать дни", callback_data: "admin_edit_days" }],
  [
    {
      text: " Редактировать прайсы и услуги",
      callback_data: "admin_edit_prices",
    },
  ],
  [{ text: " Редактировать портфолио", callback_data: "admin_edit_portfolio" }],
  [{ text: "Dump", callback_data: "create_dump" }],
  [{ text: " Logger", callback_data: "logger" }],
];
function registerHandlers(bot) {
  bot.start((ctx) => {
    const currentKeyboard =
      // ctx.from.id === ADMIN_ID ? adminKeyboard :
      clientKeyboard;
    ctx.reply("Добро пожаловать", Markup.inlineKeyboard(currentKeyboard));
  });
  bot.action("create_dump", (ctx) => {
    dumpDatabase();
    ctx.reply("backlog сформирован");
  });
  bot.action("portfolio", async (ctx) => {
    const portfolio = await getPortfolio();
    ctx.reply(
      "Ссылка на мастера и его работы : " + portfolio?.portfolio_description,
    );
  });
  bot.action("booking", async (ctx) => {
    const existing = await getBookingByUser(ctx.from.id);

    if (existing) {
      ctx.reply(
        `У вас уже есть запись

📅 ${existing.date}
⏰ ${existing.time}

Сначала отмените её`,
      );

      clearState(ctx.from.id);

      return;
    }
    ctx.reply(
      "Выберите дату",

      Markup.inlineKeyboard(buildCalendar()),
    );
  });

  bot.action(/date_(.+)/, (ctx) => {
    const date = ctx.match[1];

    ctx.reply(
      `Дата ${date}

Выберите время`,

      Markup.inlineKeyboard(timeKeyboard(date)),
    );
  });

  bot.action(/slot_(.+)_(.+)/, (ctx) => {
    const date = ctx.match[1];

    const time = ctx.match[2];

    setState(ctx.from.id, {
      step: "WAIT_NAME",

      data: { date, time },
    });

    ctx.reply("Введите ваше имя");
  });

  bot.on("text", async (ctx) => {
    console.log(ctx.message.text, " text insided");
    //portfolio logic
    if (adminState.get("step") === "WAIT_PORTFOLIO") {
      const oldPortfolio = await getPortfolio();
      const newPortfolio = ctx.message.text;
      if (!newPortfolio) {
        return;
      }
      await editPortfolio(newPortfolio);

      ctx.reply(
        "Портфолио отредактировано\n\n" +
          "Старое: \n\n" +
          oldPortfolio?.portfolio_description +
          "\n\n" +
          "Новое:\n\n" +
          newPortfolio,
      );
    }
    const state = getState(ctx.from.id);

    if (!state) return;

    if (state.step === "WAIT_NAME") {
      state.data.name = ctx.message.text;

      setState(ctx.from.id, {
        step: "WAIT_PHONE",

        data: state.data,
      });

      ctx.reply("Введите телефон или Telegram");

      return;
    }

    if (state.step === "WAIT_PHONE") {
      state.data.phone = ctx.message.text;
      try {
        await createBooking({
          ...state.data,
          user_id: ctx.from.id,
        });

        ctx.reply(
          `Запись подтверждена

${state.data.date}
${state.data.time}`,
        );

        await ctx.telegram.sendMessage(
          ADMIN_ID,

          `<b>Новая запись</b>

👤 ${state.data.name}
📞 ${state.data.phone}

📅 ${state.data.date}
⏰ ${state.data.time}`,

          { parse_mode: "HTML" },
        );

        clearState(ctx.from.id);
      } catch (e) {
        ctx.reply("Этот слот только что заняли. Выберите другой.");
      }
    }
  });

  bot.action("admin_edit_portfolio", async (ctx) => {
    const portfolio = await getPortfolio();

    ctx.reply(
      "Текущее портфолио\n\n" +
        portfolio?.portfolio_description +
        "\n\n" +
        "Введите исправление",
    );

    adminState.set("step", "WAIT_PORTFOLIO");
  });

  bot.action("logger", (ctx) => {
    ctx.reply(getLog() + " - backlog");
  });

  bot.action("cancel", async (ctx) => {
    await cancelBooking(ctx.from.id);
    ctx.editMessageReplyMarkup(undefined);
    ctx.reply("Запись отменена");
  });
}

module.exports = { registerHandlers };
