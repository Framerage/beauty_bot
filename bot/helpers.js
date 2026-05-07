function isValidRUPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')

  // заменяем 8 на 7 (единый формат)
  const normalized = cleaned[0] === '8' ? '7' + cleaned.slice(1) : cleaned

  return /^7\d{10}$/.test(normalized)
}

module.exports = { isValidRUPhone }
