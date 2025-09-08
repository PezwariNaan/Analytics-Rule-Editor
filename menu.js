const ruleSetButtons = document.getElementById('Rulesets');
const ruleNameButtons = document.getElementById('RuleNames');
const uploadButton = document.getElementById('uploadJSON');
const resourceByButton = new WeakMap();

const buttonStyle = 'bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow'
                    + ' w-full h-10 cursor-pointer whitespace-nowrap '
                    + ' data-[selected=true]:bg-blue-600 data-[selected=true]:text-white'
                    + ' data-[selected=true]:border-blue-600';

const btnDivStyle = 'bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow'
+ ' w-full h-10 whitespace-nowrap flex justify-between cursor-default'
+ ' data-[selected=true]:bg-blue-600 data-[selected=true]:text-white'
+ ' data-[selected=true]:border-blue-600';

let currentFileHandle = null;
let currentJson = null;

function makeContainerHighlightSelected(container) {
    let last_selected = null;
    
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !container.contains(btn)) return;

        if (last_selected && last_selected !== btn) {
            delete last_selected.dataset.selected;
        }

        btn.dataset.selected = 'true';
        last_selected = btn;
    });

    const observer = new MutationObserver(() => {last_selected = null});
    observer.observe(container, {childList: true});
}

document.getElementById('pickFolder').addEventListener('click', async() => {
    const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });

    ruleSetButtons.textContent = '';

    let files = [];
    for await (const [name, handle] of dirHandle.entries()) {
         if (handle.kind ==='file') files.push({ name, handle })
    }

    files.sort((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base', numeric: 'true'}));

    files.forEach(({name, handle}, i = 0) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = buttonStyle;
        btn.textContent = name;
        btn.id = i++;

        btn.addEventListener('click', async() => {
            currentFileHandle = handle;
            const file = await handle.getFile();
            const text = await file.text();
            currentJson = JSON.parse(text);
            listRules(currentJson);
        });

        ruleSetButtons.appendChild(btn);
    });
});

const listRules = async () => {
    let i = 0;
    ruleNameButtons.textContent = '';
    const resources = currentJson.resources.slice().sort((a, b) => {
        const an = a.properties.displayName;
        const bn = a.properties.displayName;
        return an.localeCompare(bn, undefined, { sensitivity: 'base', numeric: true });
    });

    uploadButton.classList.remove('hidden');

    for (const resource of resources) {
        const displayName = resource.properties.displayName;
        const span = document.createElement('span');
        const btnDiv = document.createElement('div');
        const editBtn = document.createElement('button');
        const colorCoder = document.createElement('select');
        const green = document.createElement('option');
        const yellow = document.createElement('option');
        const red = document.createElement('option');
        const blank = document.createElement('option');
        
        btnDiv.id = i;
        btnDiv.type = 'div';
        btnDiv.className = btnDivStyle;

        colorCoder.type = 'select';
        green.textContent = 'Green';
        yellow.textContent = 'Yellow';
        red.textContent = 'Red';
        blank.textContent = '';
        colorCoder.appendChild(blank)
        colorCoder.appendChild(green);
        colorCoder.appendChild(yellow);
        colorCoder.appendChild(red);
        
        span.textContent = displayName;

        editBtn.textContent = 'Edit';
        editBtn.dataset.openModal = 'true';
        editBtn.dataset.index = String(i++);
        editBtn.className = 'text-orange-500 cursor-pointer end-full';
        editBtn.dataset.title = displayName;

        btnDiv.appendChild(colorCoder);
        btnDiv.appendChild(span);
        btnDiv.appendChild(editBtn)

        resourceByButton.set(editBtn, resource);
        ruleNameButtons.appendChild(btnDiv);
    }
};

function getRuleKey(rule) {
    return String(rule.properties.displayName).toLowerCase().trim();
}

function mergeResources(baseResources, newRule) {
    const baseIndicesByKey = new Map();
    baseResources.forEach((r, i) => baseIndicesByKey.set(getRuleKey(r), i));

    const key = getRuleKey(newRule);

    if (baseIndicesByKey.has(key)) {
        const idx = baseIndicesByKey.get(key);

        ok = confirm(`Rule ${newRule.properties.displayName} alread exists. Overwrite?`);
        if (!ok) { return };

        baseResources[idx] = newRule;
    } else {
        baseIndicesByKey.set(key, baseResources.length);
        baseResources.push(newRule);
    }
}

uploadButton?.addEventListener('click', async(e) => {
    e.preventDefault();
    e.stopPropagation();

    const [fileHandle] = await window.showOpenFilePicker({
        multiple: false, 
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
    });

    const file = await fileHandle.getFile();
    const text = await file.text();
    const importedPayload = JSON.parse(text);

    mergeResources(currentJson.resources, importedPayload.resources[0]);

    await saveRuleToOriginalFile();
    await listRules();

    const msg = `Imported ${importedPayload.properties.displayName} to ${currentFileHandle.name}`

    alert(msg);
})

makeContainerHighlightSelected(ruleSetButtons);
makeContainerHighlightSelected(ruleNameButtons);
