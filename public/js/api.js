const BASE = '/api/contacts';

export async function getAllContacts() {
  const res = await fetch(BASE);
  return res.json();
}

export async function addContact(contact) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact)
  });
  return res.json();
}

export async function updateContact(id, updates) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteContact(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return res.json();
}
