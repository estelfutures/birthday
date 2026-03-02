import { getAllContacts, deleteContact } from './api.js';
import { formatDate, calculateAge, escapeHtml, getMonthName } from './utils.js';
import { openEditForm } from './form.js';
import { openModal, closeModal } from './modal.js';

let onChangeCallback = null;

export function setOnChange(cb) {
  onChangeCallback = cb;
}

export async function showContactsForDay(day, month, year) {
  const panel = document.getElementById('details-content');

  if (day === null) {
    panel.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p>Select a day to see birthdays</p>
      </div>`;
    return;
  }

  const contacts = await getAllContacts();
  const dayContacts = contacts.filter(c => {
    const [, m, d] = c.birthday.split('-').map(Number);
    return m === month && d === day;
  });

  const monthName = getMonthName(month - 1);
  let html = `<h3 class="details-header">Birthdays on ${monthName} ${day}</h3>`;

  if (dayContacts.length === 0) {
    html += `
      <div class="empty-state">
        <p>No birthdays on this day</p>
      </div>`;
  } else {
    for (const c of dayContacts) {
      const age = calculateAge(c.birthday);
      const name = escapeHtml(c.fullName);
      const emailLink = c.email
        ? `<a href="mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent('Happy Birthday, ' + c.fullName + '!')}" class="action-btn email-btn" title="Send Email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email
          </a>`
        : `<span class="action-btn email-btn disabled" title="No email address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email
          </span>`;

      const phoneClean = c.phone.replace(/[^0-9]/g, '');
      const whatsappLink = phoneClean
        ? `<a href="https://wa.me/${phoneClean}" target="_blank" rel="noopener noreferrer" class="action-btn whatsapp-btn" title="Send WhatsApp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>`
        : `<span class="action-btn whatsapp-btn disabled" title="No phone number">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </span>`;

      const details = [c.email, c.phone].filter(Boolean).join(' | ');

      html += `
        <div class="contact-card" data-id="${c.id}">
          <div class="contact-name">${name}</div>
          <div class="contact-birthday">${formatDate(c.birthday)} (age ${age})</div>
          ${details ? `<div class="contact-details">${escapeHtml(details)}</div>` : ''}
          <div class="contact-actions">
            ${emailLink}
            ${whatsappLink}
            <button class="action-btn edit-btn" data-action="edit" title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="action-btn delete-btn" data-action="delete" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              Delete
            </button>
          </div>
        </div>`;
    }
  }

  panel.innerHTML = html;

  // Wire edit/delete buttons
  panel.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.contact-card');
      const contact = dayContacts.find(c => c.id === card.dataset.id);
      openEditForm(contact, () => {
        if (onChangeCallback) onChangeCallback();
        showContactsForDay(day, month, year);
      });
    });
  });

  panel.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.contact-card');
      const contact = dayContacts.find(c => c.id === card.dataset.id);
      confirmDelete(contact, () => {
        if (onChangeCallback) onChangeCallback();
        showContactsForDay(day, month, year);
      });
    });
  });
}

function confirmDelete(contact, onComplete) {
  const name = escapeHtml(contact.fullName);
  openModal(`
    <div class="confirm-dialog">
      <h2 class="modal-title">Delete Contact</h2>
      <p>Are you sure you want to delete <strong>${name}</strong>?</p>
      <div class="form-actions">
        <button class="btn-secondary" id="cancel-delete">Cancel</button>
        <button class="btn-danger" id="confirm-delete">Delete</button>
      </div>
    </div>
  `);

  document.getElementById('cancel-delete').addEventListener('click', closeModal);
  document.getElementById('confirm-delete').addEventListener('click', async () => {
    await deleteContact(contact.id);
    closeModal();
    if (onComplete) onComplete();
  });
}
