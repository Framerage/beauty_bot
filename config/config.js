// конфигурация приложения

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_ID: Number(process.env.ADMIN_ID),

  // сколько дней показывать в календаре
  CALENDAR_DAYS: 30,

  // напоминание за сколько часов
  REMINDER_HOURS: 6,
};
