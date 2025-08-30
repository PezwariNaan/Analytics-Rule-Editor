const modal     = document.getElementById('modal-markup');
const closeBtn  = document.getElementById('modal-close');
const titleEl   = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    (closeBtn || modal).focus?.();
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true')
}

closeBtn?.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target.id === 'modal-markup' || e.target.id === 'modal-backdrop') {
        closeModal();
    }
});

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-modal');
    if (!btn) return;
    
    const title = btn.dataset.title ?? btn.textContent.trim();

    titleEl.textContent = title;

    openModal();
})