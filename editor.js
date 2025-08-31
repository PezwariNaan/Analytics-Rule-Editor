const modal     = document.getElementById('modal-markup');
const modalBody = document.getElementById('modal-body');
const closeBtn  = document.getElementById('modal-close');
const titleEl   = document.getElementById('modal-title');
const ruleTableEl = document.getElementById('modal-table');

const tableRowClass = "bg-white border-b border-gray-200 hover:bg-gray-50 whitespace-pre";
const tableKeyClass = "p-2 font-medium text-gray-900 whitespace-pre";
const tableHeaderClass = "p-2 font-large text-black bg-indigo-500/20 whitespace-pre text-center";
const tableValClass = "p-2 whitespace-pre overflow-y-auto";
const inputClass = "w-full p-1 border rounded pr-2 overfow-x-auto";
const inputClassSmall = "w-30 p-1 border rounded pr-2 overfow-x-auto";
const inputClassMedium = "w-40 p-1 border rounded pr-2 overfow-x-auto";
const dropDownClass = "w-30 p-1 border rounded pr-2 overflow-x-auto"

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

async function saveRuleToOriginalFile() {
    if (!currentFileHandle || !currentJson) {
        alert('Nothing to save.');
        return;
    }
    
    const writable = await currentFileHandle.createWritable();
    await writable.write(JSON.stringify(currentJson, null, 2));
    await writable.close();
    listRules();
    closeModal();
}

function coerceValueByKey(key, raw) {
    switch (key) {
        case 'enabled':
        case 'suppressionEnabled':
            return String(raw) === 'true';
        case 'tactics':
            if (Array.isArray(raw)) return raw;
            return String(raw).split(/[,\n]/).map(s => s.trim()).filter(Boolean)
        default:
            return raw;
    }
}

function toDisplayStringByKey(value) {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value ?? '');
}

function set(object, path ,value) {
    const keys = path
        .replace(/\[(\w+)\]/g, '.$1') // convert [index] to .index
        .split('.'); // split into keys

    const valueKey = keys.pop();
    const target = keys.reduce((target, key) => target[key], object);
    return target[valueKey] = value;
}

const makeNumberInput = (key, value, resource) => {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = dropDownClass;
    input.min = 0;
    input.value = toDisplayStringByKey(value);
    input.addEventListener('input', () => {
        set(resource, key, coerceValueByKey(key, input.value));
    });
    return input;
};

const makeTextInput = (key, value, resource) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = inputClass
    input.value = toDisplayStringByKey(value);
    input.addEventListener('input', () => {
        set(resource, key, coerceValueByKey(key, input.value));
    });
    return input;
};

const makeTextInputSmall = (key, value, resource) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = inputClassSmall;
    input.value = toDisplayStringByKey(value);
    input.addEventListener('input', () => {
        set(resource, key, coerceValueByKey(key, input.value));
    });
    return input;
};

const makeTextInputMedium = (key, value, resource) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = inputClassMedium;
    input.value = toDisplayStringByKey(value);
    input.addEventListener('input', () => {
        set(resource, key, coerceValueByKey(key, input.value));
    });
    return input;
};

const makeTextArea = (key, value, resource) => {
    const ta = document.createElement('textarea');
    ta.className = inputClass
    ta.rows = 4;
    ta.value = toDisplayStringByKey(value);
    ta.addEventListener('input', () => {
        set(resource, key, coerceValueByKey(key, input.value));
    });
    return ta;
};

const makeTextAreaQuery = (key, value, resource) => {
    const ta = document.createElement('textarea');
    ta.className = inputClass;
    ta.rows = 12;
    ta.value = toDisplayStringByKey(value);
    ta.addEventListener('input', () => {
       set(resource, key, coerceValueByKey(key, input.value));
    });
    return ta;
};

const makeSeverityDropDown = (key, value, resource) => {
    const sl = document.createElement('select');
    sl.className = dropDownClass;
    ['Informational', 'Low', 'Medium', 'High'].forEach(opt => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        sl.appendChild(o);
    });
    sl.value = String(value);
    sl.addEventListener('change', () => {
        set(resource, key, coerceValueByKey(key, sl.value));
    });
    return sl;
};

const makeEnabledDropDown = (key, value, resource) => {
    const sl = document.createElement('select');
    sl.className = dropDownClass;
    ['true', 'false'].forEach(v => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = v;
        sl.appendChild(o);
    });
    sl.value = value ? 'true' : 'false';
    sl.addEventListener('change', () => {
        set(resource, key, sl.value === 'true');
    });
    return sl;
};

const fieldRenderers = {
    displayName: makeTextInput, 
    description: makeTextArea,
    severity: makeSeverityDropDown,
    enabled: makeEnabledDropDown,
    query: makeTextAreaQuery,
    tactics: makeTextInput, 
    suppressionEnabled: makeEnabledDropDown,
    techniques: makeTextInput,
    subTechniques: makeTextInput,
    alertRuleTemplateName: makeTextInput,
    triggerThreshold: makeNumberInput,
    triggerOperator: makeTextInputSmall,
    queryFrequency: makeTextInputSmall,
    queryPeriod: makeTextInputSmall,
    suppressionDuration: makeTextInputSmall,
    createIncident: makeEnabledDropDown,
    reopenClosedIncident: makeEnabledDropDown, 
    lookbackDuration: makeTextInputSmall, 
    matchingMethod: makeTextInputMedium, 
    aggregationKind: makeTextInputMedium,
    entityType: makeTextInputMedium,
    identifier: makeTextInputMedium,
    columnName: makeTextInputMedium
};

// TODO parameterise the generation of elements

function renderObject(key, value, resource, fullpath) {
    const renderer = fieldRenderers[key] || makeTextInputMedium;
    const path = fullpath ?? key;

    if (Array.isArray(value)) {
        const hasObjects = value.some(v => v && typeof v === 'object' && !Array.isArray(v));
        if (hasObjects) {
            value.forEach((item, index) => {
                renderObject(key, item, resource, `${path}[${index}]`);
            });
            return;
        }

        let tableRow = document.createElement('tr');
        tableRow.className = tableRowClass;
        tableRow.dataset.path = path;

        let tableKey = document.createElement('td');
        tableKey.className = tableKeyClass;
        tableKey.textContent = key;
        tableKey.dataset.path = path;

        let tableVal = document.createElement('td');
        tableVal.className = tableValClass;
        tableVal.appendChild(renderer(path, toDisplayStringByKey(value), resource));
        tableVal.dataset.path = path;

        tableRow.appendChild(tableKey);
        tableRow.appendChild(tableVal);
        ruleTableEl.appendChild(tableRow);
        return; 
    }

    if (value !== null && typeof value === 'object') {
        const tableRow = document.createElement('tr');
        tableRow.className = tableRowClass;

        const tableHeader = document.createElement('th');
        tableHeader.textContent = key;
        tableHeader.className = tableHeaderClass;
        tableHeader.colSpan = 2;
        tableHeader.dataset.path = path;

        tableRow.appendChild(tableHeader);
        ruleTableEl.appendChild(tableRow);

        for (const [subKey, subVal] of Object.entries(value)) {
            renderObject(subKey, subVal, resource, `${path}.${subKey}`);
        }
        return;
    }

    let tableRow = document.createElement('tr');
    tableRow.className = tableRowClass;

    let tableKey = document.createElement('td');
    tableKey.className = tableKeyClass;
    tableKey.textContent = key;
    tableKey.dataset.path = path;

    let tableVal = document.createElement('td');
    tableVal.className = tableValClass;
    tableVal.appendChild(renderer(path, value, resource));
    tableVal.dataset.path = path;

    tableRow.appendChild(tableKey);
    tableRow.appendChild(tableVal);
    ruleTableEl.appendChild(tableRow);
}

// Dynamically Render the Modal
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-modal]');
    if (!btn) return;
    
    const resource = resourceByButton.get(btn);
    const title = btn.dataset.title;
    const index = Number(btn.dataset.index);

    modal.dataset.ruleIndex = String(index);

    titleEl.textContent = title;
    ruleTableEl.innerHTML = '';

    if (resource) {
        for (const [key, value] of Object.entries(resource.properties)) {
            renderObject(key, value, resource.properties, key);
        }
    }

    openModal();
});

document.getElementById('deleteRule')?.addEventListener('click', async(e) => {
    e.preventDefault();
    e.stopPropagation();

    const idx = Number(modal.dataset.ruleIndex);

    if (!Number.isInteger(idx) || idx < 0 || idx >= currentJson.resources.length) {
        alert ('Invalid rule reference. Tell Pez he\'s trash.');
        return ;
    }

    const rule = currentJson.resources[idx];
    const name = rule.properties.displayName;

    const ok = confirm(`Delete Rule: "${name}" from "${currentFileHandle.name}"?`)
    if (!ok) return;

    currentJson.resources.splice(idx, 1);

    saveRuleToOriginalFile();

    listRules();
    closeModal();
});

document.getElementById('saveRule')?.addEventListener('click', saveRuleToOriginalFile);

closeBtn?.addEventListener('click', closeModal);