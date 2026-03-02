import { getMonthName } from './utils.js';
import { getAllContacts } from './api.js';

let currentYear, currentMonth; // 0-indexed month
let selectedDay = null;
let contacts = [];
let onDayClickCallback = null;

export async function initCalendar(onDayClick) {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  onDayClickCallback = onDayClick;

  document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
  document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
  document.getElementById('today-btn').addEventListener('click', goToToday);

  await refreshCalendar();
}

export async function refreshCalendar() {
  contacts = await getAllContacts();
  render();
}

function navigateMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  selectedDay = null;
  render();
}

function goToToday() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  selectedDay = null;
  render();
}

function getBirthdayCounts() {
  const counts = new Map();
  const displayMonth = currentMonth + 1; // 1-indexed
  for (const c of contacts) {
    const [, m, d] = c.birthday.split('-').map(Number);
    if (m === displayMonth) {
      counts.set(d, (counts.get(d) || 0) + 1);
    }
  }
  return counts;
}

function render() {
  const grid = document.getElementById('calendar-grid');
  const title = document.getElementById('calendar-title');
  title.textContent = `${getMonthName(currentMonth)} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const counts = getBirthdayCounts();

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === currentYear && now.getMonth() === currentMonth;
  const todayDate = now.getDate();

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"><span class="day-number"></span></div>';
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && day === todayDate;
    const isSelected = day === selectedDay;
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';

    const count = counts.get(day) || 0;
    const badge = count > 0 ? `<span class="birthday-badge">${count}</span>` : '';

    html += `<div class="${classes}" data-day="${day}">
      <span class="day-number">${day}</span>
      ${badge}
    </div>`;
  }

  grid.innerHTML = html;

  // Delegated click handler
  grid.onclick = (e) => {
    const cell = e.target.closest('.calendar-day:not(.empty)');
    if (!cell) return;
    const day = parseInt(cell.dataset.day);
    if (selectedDay === day) {
      selectedDay = null;
    } else {
      selectedDay = day;
    }
    render();
    if (onDayClickCallback) {
      onDayClickCallback(selectedDay, currentMonth + 1, currentYear);
    }
  };
}

export function getSelectedDay() {
  return selectedDay ? { day: selectedDay, month: currentMonth + 1, year: currentYear } : null;
}
