const dayjs = require("dayjs");
const { REMINDER_HOURS } = require("../config/config");

function scheduleReminder(bot, userId, booking) {
  const bookingTime = dayjs(`${booking.date} ${booking.time}`);

  const reminder = bookingTime.subtract(REMINDER_HOURS, "hour");

  const delay = reminder.diff(dayjs());

  if (delay <= 0) return;

  setTimeout(() => {
    bot.telegram.sendMessage(
      userId,
      `Напоминание 💄

Вы записаны на услугу:
${booking.service}

Дата: ${booking.date}
Время: ${booking.time}

Будем ждать вас ❤️`,
    );
  }, delay);
}

module.exports = {
  scheduleReminder,
};
