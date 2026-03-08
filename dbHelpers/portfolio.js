const { db } = require("../database/db");
async function editPortfolio(text) {
  const oldValue = await getPortfolio();
  return new Promise((resolve, reject) => {
    if (!oldValue) {
      db.run(
        `INSERT OR IGNORE INTO portfolio(id,portfolio_description) VALUES (?,?)`,
        [1, text],
        function (err) {
          if (err) return reject(err);

          resolve(this.lastID);
        },
      );
      return;
    }
    db.run(
      `UPDATE portfolio
SET portfolio_description = ?
WHERE id = 1
      `,
      [text],
      function (err) {
        if (err) return reject(err);

        resolve();
      },
    );
  });
}
// UPDATE slots SET booked=1 WHERE date=?`, [date]
function getPortfolio() {
  return new Promise((resolve) => {
    db.get(`SELECT * FROM portfolio WHERE id = 1`, (err, row) => resolve(row));
  });
}

module.exports = {
  editPortfolio,
  getPortfolio,
};
