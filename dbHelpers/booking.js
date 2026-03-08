const { db } = require("../database/db");

async function createBooking(data) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO bookings(user_id,name,phone,service,date,time)
      VALUES(?,?,?,?,?,?)`,
      [data.user_id, data.name, data.phone, data.service, data.date, data.time],
      function (err) {
        if (err) return reject(err);

        resolve(this.lastID);
      },
    );
  });
}

async function cancelBooking(userId) {
  return new Promise((resolve) => {
    db.get(`SELECT * FROM bookings WHERE user_id=?`, [userId], (err, row) => {
      if (!row) return resolve(null);

      db.run(`DELETE FROM bookings WHERE id=?`, [row.id], () => {
        db.run(`UPDATE slots SET booked=0 WHERE date=? AND time=?`, [
          row.date,
          row.time,
        ]);

        resolve(row);
      });
    });
  });
}

function getBookingByUser(userId) {
  return new Promise((resolve) => {
    db.get(`SELECT * FROM bookings WHERE user_id=?`, [userId], (err, row) =>
      resolve(row),
    );
  });
}

function getBookingsByDate(date) {
  return new Promise((resolve) => {
    db.all(
      `SELECT time FROM bookings WHERE date=?`,

      [date],

      (err, rows) => {
        resolve(rows.map((r) => r.time));
      },
    );
  });
}
module.exports = {
  createBooking,
  cancelBooking,
  getBookingByUser,
  getBookingsByDate,
};
