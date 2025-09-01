const modal               = document.getElementById('modal-markup');
const modalBody           = document.getElementById('modal-body');
const closeBtn            = document.getElementById('modal-close');
const titleEl             = document.getElementById('modal-title');
const ruleTableEl         = document.getElementById('modal-table');

const tableRowClass       = "bg-white border-b border-gray-200 hover:bg-gray-50 whitespace-pre";
const tableKeyClass       = "p-2 font-medium text-gray-900 whitespace-pre";
const tableHeaderClass    = "p-2 font-large text-black bg-indigo-500/20 whitespace-pre";
const tableValClass       = "p-2 whitespace-pre overflow-y-auto";
const inputClass          = "w-full p-1 border rounded pr-2 overfow-x-auto";
const inputClassSmall     = "w-30 p-1 border rounded pr-2 overfow-x-auto";
const inputClassMedium    = "w-40 p-1 border rounded pr-2 overfow-x-auto";
const dropDownClass       = "w-30 p-1 border rounded pr-2 overflow-x-auto"

const fieldRenderers = {
    displayName            : makeTextInput, 
    description            : makeTextArea,
    severity               : makeSeverityDropDown,
    enabled                : makeEnabledDropDown,
    query                  : makeTextAreaQuery,
    tactics                : makeTextInput, 
    suppressionEnabled     : makeEnabledDropDown,
    techniques             : makeTextInput,
    subTechniques          : makeTextInput,
    alertRuleTemplateName  : makeTextInput,
    triggerThreshold       : makeNumberInput,
    triggerOperator        : makeTextInputSmall,
    queryFrequency         : makeTextInputSmall,
    queryPeriod            : makeTextInputSmall,
    suppressionDuration    : makeTextInputSmall,
    createIncident         : makeEnabledDropDown,
    reopenClosedIncident   : makeEnabledDropDown, 
    lookbackDuration       : makeTextInputSmall, 
    matchingMethod         : makeTextInputMedium, 
    aggregationKind        : makeTextInputMedium,
    entityType             : makeTextInputMedium,
    identifier             : makeTextInputMedium,
    columnName             : makeTextInputMedium
};

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

function renderObject(key, value, resource, fullpath, parentEl = ruleTableEl) {
    const renderer = fieldRenderers[key] || makeTextInputMedium;
    const path = fullpath ?? key;
    const indent = 4;
    let depth = 0;

    if (Array.isArray(value)) {
        const hasObjects = value.some(v => v && typeof v === 'object' && !Array.isArray(v));
        if (hasObjects) {
            const nestedTable = createNestedEl(parentEl, key, path, indent, depth);

            value.forEach((item, index) => {
                renderObject(`Index: ${index}`, item, resource, `${path}[${index}]`, nestedTable);
            });
            
            return;
        }

        let tableRowEl = genTableRow(path, key, value, renderer, resource);
        ruleTableEl.appendChild(tableRowEl);

        return ; 
    }

    if (value !== null && typeof value === 'object') {
        const nestedTable = createNestedEl(parentEl, key, path, indent, depth);

        for (const [subKey, subVal] of Object.entries(value)) {
            renderObject(subKey, subVal, resource, `${path}.${subKey}`, nestedTable);
        }

        return;
    }

    const tableRowEl = genTableRow(path, key, value, renderer, resource);
    parentEl.appendChild(tableRowEl);
    depth++;
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