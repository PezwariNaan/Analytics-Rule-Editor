const modal     = document.getElementById('modal-markup');
const modalBody = document.getElementById('modal-body');
const closeBtn  = document.getElementById('modal-close');
const titleEl   = document.getElementById('modal-title');
const ruleTableEl = document.getElementById('modal-table');

const tableRowClass = "bg-white border-b border-gray-200 hover:bg-gray-50 whitespace-pre";
const tableKeyClass = "px-6 py-4 font-medium text-gray-900 whitespace-pre";
const tableValClass = "px-6 py-4 whitespace-pre";

function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    ruleTableEl.innerHTML = '';
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('overflow-hidden');

}

closeBtn?.addEventListener('click', closeModal);

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-modal]');
    if (!btn) return;
    
    const resource = resourceByButton.get(btn);

    const title = btn.dataset.title;
    titleEl.textContent = title;

    const mainEl = document.getElementById('modal-main');
    if (resource) {
        for (const [key, value] of Object.entries(resource.properties)) {
            let tableKey = document.createElement('td');
            let tableVal = document.createElement('td');
            let tableRow = document.createElement('tr');

            tableRow.className = tableRowClass;

            tableKey.textContent = key;
            tableKey.className = tableKeyClass;

            tableVal.textContent = value;
            tableVal.className = tableValClass;

            ruleTableEl.appendChild(tableRow);
            tableRow.appendChild(tableKey);
            tableRow.appendChild(tableVal);
        }      
    }

    openModal();
});
