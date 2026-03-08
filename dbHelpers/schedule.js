const { db } = require("../database/db");

function addSlot(date, time) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO slots(date,time,booked) VALUES(?,?,0)`,
      [date, time],
      function (err) {
        if (err) return reject(err);

        resolve(this.lastID);
      },
    );
  });
}

function deleteSlot(date, time) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM slots WHERE date=? AND time=?`,
      [date, time],
      function (err) {
        if (err) return reject(err);

        resolve();
      },
    );
  });
}

function closeDay(date) {
  return new Promise((resolve) => {
    db.run(`UPDATE slots SET booked=1 WHERE date=?`, [date], () => resolve());
  });
}

function getSlots(date) {
  return new Promise((resolve) => {
    db.all(`SELECT * FROM slots WHERE date=?`, [date], (err, rows) =>
      resolve(rows || []),
    );
  });
}

module.exports = {
  addSlot,
  deleteSlot,
  closeDay,
  getSlots,
};
