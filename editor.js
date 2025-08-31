const modal     = document.getElementById('modal-markup');
const modalBody = document.getElementById('modal-body');
const closeBtn  = document.getElementById('modal-close');
const titleEl   = document.getElementById('modal-title');
const ruleTableEl = document.getElementById('modal-table');

const tableRowClass = "bg-white border-b border-gray-200 hover:bg-gray-50 whitespace-pre";
const tableKeyClass = "p-2 font-medium text-gray-900 whitespace-pre";
const tableValClass = "p-2 whitespace-pre";
const dropDownClass = ""

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

const makeEditable = (value) => {
    let td = document.createElement('td');
    td.className = tableValClass;
    td.setAttribute('contenteditable', 'true');
    td.textContent = value;
    return td;
}

const makeSeverityDropDown = (value) => {
    let sl = document.createElement('select');
    let op1 = document.createElement('option');
    let op2 = document.createElement('option');
    let op3 = document.createElement('option');
    let op4 = document.createElement('option');

    op1.value = 'Informational';
    op1.textContent = 'Informational';

    op2.value = 'Low';
    op2.textContent = 'Low';

    op3.value = 'Medium';
    op3.textContent = 'Medium';

    op4.value = 'High';
    op4.textContent = 'High';

    sl.appendChild(op1)
    sl.appendChild(op2)
    sl.appendChild(op3)
    sl.appendChild(op4)

    return sl
}

const makeEnabledDropDown = (value) => {
    let sl = document.createElement('select');
    let op1 = document.createElement('option');
    let op2 = document.createElement('option');

    op1.value = 'true';
    op1.textContent = 'true';

    op2.value = 'false';
    op2.textContent = 'false'

    sl.appendChild(op1);
    sl.appendChild(op2);

    return sl
}

const makeBool = (value) => {
    let tb = document.createElement('checkbox');

}

const fieldRenderers = {
    displayName: makeEditable, 
    description: makeEditable,
    severity: makeSeverityDropDown,
    enabled: makeEnabledDropDown,
    query: makeEditable,
    tactics: makeEditable, 
    suppressionEnabled: makeEnabledDropDown
};

function defaultRenderer(value) { 
    const td = document.createElement('td');
    td.className = tableValClass;
    td.textContent = value ?? '';
    return td;
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-modal]');
    if (!btn) return;
    
    const resource = resourceByButton.get(btn);

    const title = btn.dataset.title;
    titleEl.textContent = title;

    if (resource) {
        for (const [key, value] of Object.entries(resource.properties)) {
            const renderer = fieldRenderers[key] || defaultRenderer;

            let tableRow = document.createElement('tr');
            let tableKey = document.createElement('td');
            let tableVal = document.createElement('td');

            tableRow.className = tableRowClass;

            tableKey.className = tableKeyClass;
            tableKey.textContent = key;
            
            tableVal.className = tableValClass;
            tableVal.appendChild(renderer(value));

            ruleTableEl.appendChild(tableRow);
            tableRow.appendChild(tableKey);
            tableRow.appendChild(tableVal);
        }      
    }

    openModal();
});