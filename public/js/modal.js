const overlay = () => document.getElementById('modal-overlay');
const body = () => document.getElementById('modal-body');

let onCloseCallback = null;

export function openModal(html, onClose) {
  body().innerHTML = html;
  overlay().classList.add('visible');
  onCloseCallback = onClose || null;
}

export function closeModal() {
  overlay().classList.remove('visible');
  if (onCloseCallback) {
    onCloseCallback();
    onCloseCallback = null;
  }
}

export function initModal() {
  overlay().addEventListener('click', (e) => {
    if (e.target === overlay()) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay().classList.contains('visible')) {
      closeModal();
    }
  });
}
