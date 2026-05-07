const { generateSlots } = require('../dbHelpers/slotGenerator')

// function timeKeyboard(date) {
//   const times = generateSlots();

//   const rows = [];

//   let row = [];

//   times.forEach((t) => {
//     row.push({
//       text: t,

//       callback_data: `slot_${date}_${t}`,
//     });

//     if (row.length === 3) {
//       rows.push(row);

//       row = [];
//     }
//   });

//   if (row.length) rows.push(row);

//   return rows;
// }

const timeKeyboard = (date, chunkSize = 3) => {
  return generateSlots()
    .map((time) => {
      console.log(time, ' cur time ')
      return {
        text: time,
        callback_data: `slot_${date}_${time}`,
      }
    })
    .reduce((rows, btn, i) => {
      if (i % chunkSize === 0) rows.push([])
      rows[rows.length - 1].push(btn)
      return rows
    }, [])
}

module.exports = { timeKeyboard }
