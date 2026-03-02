import { openModal, closeModal } from './modal.js';
import { addContact, updateContact } from './api.js';
import { sanitizePhone } from './utils.js';

function getFormHtml(title, contact) {
  const today = new Date().toISOString().split('T')[0];
  return `
    <h2 class="modal-title">${title}</h2>
    <form id="contact-form">
      <div class="form-group">
        <label for="fullName">Full Name *</label>
        <input type="text" id="fullName" required maxlength="100"
               value="${contact ? contact.fullName : ''}" placeholder="e.g. Jane Doe">
        <div class="error-msg" id="name-error">Name is required</div>
      </div>
      <div class="form-group">
        <label for="birthday">Birthday *</label>
        <input type="date" id="birthday" required max="${today}"
               value="${contact ? contact.birthday : ''}">
        <div class="error-msg" id="birthday-error">Birthday is required</div>
      </div>
      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input type="tel" id="phone" placeholder="+1 555 123 4567"
               value="${contact ? contact.phone : ''}">
      </div>
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" placeholder="jane@example.com"
               value="${contact ? contact.email : ''}">
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="cancel-btn">Cancel</button>
        <button type="submit" class="btn-primary">${contact ? 'Update' : 'Save'} Contact</button>
      </div>
    </form>
  `;
}

function wireForm(onSave) {
  const form = document.getElementById('contact-form');
  document.getElementById('cancel-btn').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const birthday = document.getElementById('birthday').value;
    const phone = sanitizePhone(document.getElementById('phone').value);
    const email = document.getElementById('email').value.trim();

    // Validate
    let valid = true;
    if (!fullName) {
      document.getElementById('fullName').classList.add('invalid');
      document.getElementById('name-error').classList.add('show');
      valid = false;
    }
    if (!birthday) {
      document.getElementById('birthday').classList.add('invalid');
      document.getElementById('birthday-error').classList.add('show');
      valid = false;
    }
    if (!valid) return;

    await onSave({ fullName, birthday, phone, email });
    closeModal();
  });

  // Clear errors on input
  ['fullName', 'birthday'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      document.getElementById(id).classList.remove('invalid');
      const errorId = id === 'fullName' ? 'name-error' : 'birthday-error';
      document.getElementById(errorId).classList.remove('show');
    });
  });
}

export function openAddForm(onComplete) {
  openModal(getFormHtml('Add Contact', null));
  wireForm(async (data) => {
    await addContact(data);
    if (onComplete) onComplete();
  });
}

export function openEditForm(contact, onComplete) {
  openModal(getFormHtml('Edit Contact', contact));
  wireForm(async (data) => {
    await updateContact(contact.id, data);
    if (onComplete) onComplete();
  });
}
