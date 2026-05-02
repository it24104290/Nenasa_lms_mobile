const crypto = require('crypto');

function nowIso() {
  return new Date().toISOString();
}

function id(prefix = 'id') {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

function normalizeRole(role) {
  const normalized = String(role || '').trim().toUpperCase().replace(/^ROLE_/, '');
  if (['ADMIN', 'TEACHER', 'STUDENT', 'PAYMENT_OFFICER'].includes(normalized)) {
    return normalized;
  }
  return 'STUDENT';
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

module.exports = {
  nowIso,
  id,
  normalizeRole,
  safeNumber,
};
