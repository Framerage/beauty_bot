const { generateSlots } = require("../dbHelpers/slotGenerator");

function timeKeyboard(date) {
  const times = generateSlots();

  const rows = [];

  let row = [];

  times.forEach((t) => {
    row.push({
      text: t,

      callback_data: `slot_${date}_${t}`,
    });

    if (row.length === 3) {
      rows.push(row);

      row = [];
    }
  });

  if (row.length) rows.push(row);

  return rows;
}

module.exports = { timeKeyboard };
