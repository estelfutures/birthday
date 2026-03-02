const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getMonthName(monthIndex) {
  return MONTH_NAMES[monthIndex];
}

export function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export function calculateAge(dateStr) {
  const [birthYear, birthMonth, birthDay] = dateStr.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - birthYear;
  const monthDiff = (now.getMonth() + 1) - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDay)) {
    age--;
  }
  return age;
}

export function sanitizePhone(phone) {
  return phone.replace(/[^0-9+]/g, '');
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
