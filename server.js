const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'contacts.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readContacts() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, '[]');
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeContacts(contacts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
}

// Get all contacts
app.get('/api/contacts', (req, res) => {
  res.json(readContacts());
});

// Add a new contact
app.post('/api/contacts', (req, res) => {
  const { fullName, birthday, phone, email, socialPlatform, socialUrl, category, notes } = req.body;
  if (!fullName || !birthday) {
    return res.status(400).json({ error: 'Full name and birthday are required' });
  }
  const contacts = readContacts();
  const newContact = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    birthday,
    phone: phone || '',
    email: email || '',
    socialPlatform: socialPlatform || '',
    socialUrl: socialUrl || '',
    category: category || '',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  writeContacts(contacts);
  res.status(201).json(newContact);
});

// Update a contact
app.put('/api/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const index = contacts.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  const { fullName, birthday, phone, email, socialPlatform, socialUrl, category, notes } = req.body;
  if (fullName !== undefined) contacts[index].fullName = fullName.trim();
  if (birthday !== undefined) contacts[index].birthday = birthday;
  if (phone !== undefined) contacts[index].phone = phone;
  if (email !== undefined) contacts[index].email = email;
  if (socialPlatform !== undefined) contacts[index].socialPlatform = socialPlatform;
  if (socialUrl !== undefined) contacts[index].socialUrl = socialUrl;
  if (category !== undefined) contacts[index].category = category;
  if (notes !== undefined) contacts[index].notes = notes;
  writeContacts(contacts);
  res.json(contacts[index]);
});

// Delete a contact
app.delete('/api/contacts/:id', (req, res) => {
  let contacts = readContacts();
  const initialLength = contacts.length;
  contacts = contacts.filter(c => c.id !== req.params.id);
  if (contacts.length === initialLength) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  writeContacts(contacts);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Birthday Tracker running at http://localhost:${PORT}`);
});
