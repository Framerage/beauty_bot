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

const { Markup } = require('telegraf')

const { buildCalendar } = require('./calendar')

const { timeKeyboard } = require('./keyboards')

const { isValidRUPhone } = require('./helpers')
const { setState, getState, clearState } = require('../utils/fsm')

const {
  createBooking,
  cancelBooking,
  getBookingByUser,
  updateBooking,
} = require('../dbHelpers/booking')
//TODO: use update booking anywhere
const { getPortfolio, editPortfolio } = require('../dbHelpers/portfolio')
const { ADMIN_ID: ENV_ADMIN_ID } = require('../config/config')
const ADMIN_ID = ENV_ADMIN_ID
const { getLog, dumpDatabase } = require('../utils/logger')
const adminState = new Map()

const clientKeyboard = [
  [{ text: '📅 Записаться', callback_data: 'booking' }],
  [{ text: '💰 Прайсы', callback_data: 'prices' }],
  [{ text: '📷 Портфолио', callback_data: 'portfolio' }],
  [{ text: '⛔ Отменить запись', callback_data: 'cancel' }],
]

const adminKeyboard = [
  //   [{ text: "➕ Добавить слот", callback_data: "admin_add_slot" }],
  //   [{ text: "➖ Удалить слот", callback_data: "admin_delete_slot" }],
  //   [{ text: "📅 Посмотреть день", callback_data: "admin_view_day" }],
  //   [{ text: "⛔ Закрыть день", callback_data: "admin_close_day" }],
  [{ text: ' Редактировать дни', callback_data: 'admin_edit_days' }],
  [
    {
      text: ' Редактировать прайсы и услуги',
      callback_data: 'admin_edit_prices',
    },
  ],
  [{ text: ' Редактировать портфолио', callback_data: 'admin_edit_portfolio' }],
  [{ text: 'Dump', callback_data: 'create_dump' }],
  [{ text: ' Logger', callback_data: 'logger' }],
]
function registerHandlers(bot) {
  bot.start((ctx) => {
    //TODO: create admin panel
    const currentKeyboard =
      // ctx.from.id === ADMIN_ID ? adminKeyboard :
      clientKeyboard
    ctx.reply('Добро пожаловать', Markup.inlineKeyboard(currentKeyboard))
  })
  bot.action('create_dump', (ctx) => {
    dumpDatabase()
    ctx.reply('backlog сформирован')
  })
  bot.action('portfolio', async (ctx) => {
    const portfolio = await getPortfolio()
    ctx.reply('Ссылка на мастера и его работы : ' + portfolio?.portfolio_description)
  })
  bot.action('booking', async (ctx) => {
    const existing = await getBookingByUser(ctx.from.id)

    if (existing) {
      setState(ctx.from.id, {
        existing: true,
        existData: { ...existing },
        hasAnyChanges: true,
        // step: 'WAIT_NAME',

        // data: { date, time },
      })
      // ctx.reply(
      //   `У вас уже есть запись

      //   📅 ${existing.date}
      //   ⏰ ${existing.time}

      //   Сначала отмените её`,
      // )

      // clearState(ctx.from.id)

      // return
    }
    ctx.reply(
      !!existing ? 'Выберите новую дату' : 'Выберите дату',

      Markup.inlineKeyboard(buildCalendar()),
    )
  })

  bot.action(/date_(.+)/, async (ctx) => {
    const date = ctx.match[1]

    ctx.reply(
      `Дата ${date}

      Выберите время`,
      Markup.inlineKeyboard(timeKeyboard(date)),
    )
  })

  bot.action(/slot_(.+)_(.+)/, (ctx) => {
    const date = ctx.match[1]

    const time = ctx.match[2]

    const state = getState(ctx.from.id)

    ctx.reply('Время выбрано')

    if (!state) {
      setState(ctx.from.id, {
        step: 'WAIT_NAME',

        data: { date, time },
      })
      ctx.reply('Введите ваше имя')

      return
    }
    setState(ctx.from.id, {
      ...state,
      step: 'WAIT_NAME_ACCESS',

      data: { date, time },
    })
    ctx.reply('Вы желаете изменить Ваше имя? (да / нет)')
  })

  bot.on('text', async (ctx) => {
    console.log(ctx.message.text, ' text insided', ctx.from.id)
    //portfolio logic
    if (adminState.get('step') === 'WAIT_PORTFOLIO') {
      const oldPortfolio = await getPortfolio()
      const newPortfolio = ctx.message.text
      if (!newPortfolio) {
        return
      }
      await editPortfolio(newPortfolio)

      ctx.reply(
        'Портфолио отредактировано\n\n' +
          'Старое: \n\n' +
          oldPortfolio?.portfolio_description +
          '\n\n' +
          'Новое:\n\n' +
          newPortfolio,
      )
    }
    //
    const state = getState(ctx.from.id)

    if (!state) return

    // if (state.existing) {
    //   if (state.step === 'WAIT_NAME') {
    //     setState(ctx.from.id, { ...state, step: 'WAIT_NAME_ACCESS' })
    //     // ctx.reply('Вы желаете изменить Ваше имя? (да / нет)')
    //   }
    //   return
    // }
    if (state.step === 'WAIT_NAME_ACCESS') {
      // ctx.reply('Введите ваше имя')
      if (ctx.message.text === 'да') {
        setState(ctx.from.id, { ...state, step: 'WAIT_NAME' })
        //TODO: test mutable and crate global state
        // state.step = 'WAIT_NAME'
        return
      } else if (ctx.message.text === 'нет') {
        setState(ctx.from.id, {
          ...state,
          step: 'WAIT_PHONE_ACCESS',
          data: { ...state.data, name: state.existData.name },
        })
        ctx.reply('Вы желаете изменить Ваш телефон? (да / нет)')
        return
      } else {
        ctx.reply('Ответ должен быть в формате: да / нет')
      }
    }
    //TODO: добавить проверку экзиста. Если он есть, то спросить изменить ли имя
    if (state.step === 'WAIT_NAME') {
      // ctx.reply('Введите ваше имя')

      // state.data.name = ctx.message.text

      setState(ctx.from.id, {
        step: 'WAIT_PHONE',

        data: { ...state.data, name: ctx.message.text },
      })

      ctx.reply('Введите телефон или Telegram')

      return
    }
    if (state.step === 'WAIT_PHONE_ACCESS') {
      if (ctx.message.text === 'да') {
        setState(ctx.from.id, { ...state, step: 'WAIT_PHONE' })
        return
      } else if (ctx.message.text === 'нет') {
        setState(ctx.from.id, {
          ...state,
          step: 'WAIT_PHONE_ACCESS',
          data: { ...state.data, phone: state.existData.phone },
        })
        ctx.reply('Вы желаете изменить Ваш телефон? (да / нет)')
        return
      } else {
        ctx.reply('Ответ должен быть в формате: да / нет')
      }
    }

    if (state.step === 'WAIT_PHONE') {
      if (!isValidRUPhone(ctx.message.text)) {
        ctx.reply('Введите верный формат телефона  8 999 888 9999')
        return
      }
      setState(ctx.from.id, {
        ...state,
        step: !!state?.hasAnyChanges ? 'EDIT_DATA' : 'CREATE_DATA',
        data: { ...state.data, phone: ctx.message.text },
      })
      //TODO: test this mutable
      // state.data.phone = ctx.message.text

      // try {

      ///

      // }
      // catch (e) {
      //   ctx.reply("Этот слот только что заняли. Выберите другой.");
      // }
    }

    if (state.step === 'CREATE_DATA') {
      await createBooking({
        ...state.data,
        user_id: ctx.from.id,
      })

      ctx.reply(
        `Запись подтверждена

        ${state.data.date}
        ${state.data.time}`,
      )

      await ctx.telegram.sendMessage(
        ADMIN_ID,

        `<b>Новая запись</b>
  
          👤 ${state.data.name}
          📞 ${state.data.phone}
  
          📅 ${state.data.date}
          ⏰ ${state.data.time}`,

        { parse_mode: 'HTML' },
      )
    }
    if (state.step === 'EDIT_DATA') {
      await updateBooking(ctx.from.id, { ...state.data })

      ctx.reply(
        `Запись отредактирована

        ${state.data.name}
        ${state.data.phone}
        ${state.data.date}
        ${state.data.time}`,
      )

      await ctx.telegram.sendMessage(
        ADMIN_ID,

        `<b>Запись была отредактирована</b>
  
          👤 ${state.existData.name} > ${state.data.name}
          📞 ${state.existData.phone} >${state.data.phone}
  
          📅 ${state.existData.date} >${state.data.date}
          ⏰ ${state.existData.time} >${state.data.time}`,

        { parse_mode: 'HTML' },
      )
    }

    clearState(ctx.from.id)
  })

  bot.action('admin_edit_portfolio', async (ctx) => {
    const portfolio = await getPortfolio()

    ctx.reply(
      'Текущее портфолио\n\n' + portfolio?.portfolio_description + '\n\n' + 'Введите исправление',
    )

    adminState.set('step', 'WAIT_PORTFOLIO')
  })

  bot.action('logger', (ctx) => {
    ctx.reply(getLog() + ' - backlog')
  })

  bot.action('cancel', async (ctx) => {
    const state = await getBookingByUser(ctx.from.id)

    await cancelBooking(ctx.from.id)

    await ctx.telegram.sendMessage(
      ADMIN_ID,

      `<b>Запись отменена</b>

      👤 ${state.name}
      📞 ${state.phone}

      📅 ${state.date}
      ⏰ ${state.time}`,

      { parse_mode: 'HTML' },
    )

    ctx.editMessageReplyMarkup(undefined)
    ctx.reply('Запись отменена')
  })
}

module.exports = { registerHandlers }
