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

const genTableRow = (path, key, value, renderer, resource) => {
    let tableRow = document.createElement('tr');
    tableRow.className = tableRowClass;
    tableRow.dataset.path = path;

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
    return tableRow;
}

const createNestedEl = (parentEl, key, path, indent, depth) => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        const nestedTable = document.createElement('table');

        summary.textContent = key;
        summary.className = tableHeaderClass;
        summary.dataset.path = path;

        nestedTable.className = `w-full text-sm text-left rtl:text-right indent-${indent * depth}`;

        details.appendChild(summary);
        details.appendChild(nestedTable);

        const wrapperRow = document.createElement('tr');
        const wrapperCell = document.createElement('td');
        wrapperCell.colSpan = 2;
        wrapperCell.appendChild(details);
        wrapperRow.appendChild(wrapperCell);
        wrapperRow.className = tableRowClass;

        parentEl.appendChild(wrapperRow);

        return nestedTable;
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