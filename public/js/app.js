import { initCalendar, refreshCalendar, getSelectedDay } from './calendar.js';
import { showContactsForDay, setOnChange } from './contacts.js';
import { openAddForm } from './form.js';
import { initModal } from './modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  initModal();

  // Wire calendar day clicks to the details panel
  await initCalendar((day, month, year) => {
    showContactsForDay(day, month, year);
  });

  // When contacts change, refresh the calendar
  setOnChange(async () => {
    await refreshCalendar();
    const sel = getSelectedDay();
    if (sel) showContactsForDay(sel.day, sel.month, sel.year);
  });

  // Add Contact button
  document.getElementById('add-contact-btn').addEventListener('click', () => {
    openAddForm(async () => {
      await refreshCalendar();
      const sel = getSelectedDay();
      if (sel) showContactsForDay(sel.day, sel.month, sel.year);
    });
  });
});
