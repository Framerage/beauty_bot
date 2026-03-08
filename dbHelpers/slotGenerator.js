const dayjs = require("dayjs");

function generateSlots(start = "10:00", step = 90, count = 6) {
  const slots = [];

  let time = dayjs(`2024-01-01 ${start}`);

  for (let i = 0; i < count; i++) {
    slots.push(time.format("HH:mm"));

    time = time.add(step, "minute");
  }

  return slots;
}

module.exports = { generateSlots };
