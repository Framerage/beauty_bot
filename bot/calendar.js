const dayjs = require("dayjs");

const DAYS_IN_ROW = 4; // сколько кнопок в строке

function buildCalendar() {
  const firstDay = dayjs().startOf("month");
  const monthDays = firstDay.daysInMonth();
  const btns = [];
  let btnsRow = [];

  for (let i = 0; i < monthDays; i++) {
    const date = firstDay.add(i, "day");
    const dateStr = date.format("YYYY-MM-DD");

    btnsRow.push({
      text: date.format("DD"),
      callback_data: `date_${dateStr}`,
    });

    if (btnsRow.length === DAYS_IN_ROW) {
      btns.push(btnsRow);
      btnsRow = [];
    }
  }

  if (btnsRow.length) btns.push(btnsRow);
  btns.push([
    {
      text: "Остановить запись",
      callback_data: `cancel`,
    },
  ]);
  return btns;
}

module.exports = { buildCalendar };
