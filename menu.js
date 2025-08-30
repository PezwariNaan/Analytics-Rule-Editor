const ruleSetButtons = document.getElementById('Rulesets');
const ruleNameButtons = document.getElementById('RuleNames');

const buttonStyle = 'bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow'
                    + ' w-full h-10 cursor-pointer whitespace-nowrap '
                    + ' data-[selected=true]:bg-blue-600 data-[selected=true]:text-white'
                    + ' data-[selected=true]:border-blue-600';

function makeConatinerHighlightSelected(container) {
    let last_selected = null;
    
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !container.contains(btn)) return;

        if (last_selected && last_selected !== btn) last_selected.dataset.selected = false;
        btn.dataset.selected = 'true';
        last_selected = btn;
    });

    const observer = new MutationObserver(() => {last = null});
    observer.observe(container, {childList: true});
}

makeConatinerHighlightSelected(ruleSetButtons);
// makeConatinerHighlightSelected(ruleNameButtons);

document.getElementById('pickFolder').addEventListener('click', async() => {
    let i = 0;
    const dirHandle = await window.showDirectoryPicker({ mode: 'read' });

    ruleSetButtons.textContent = '';

    for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = buttonStyle;
            btn.textContent = name;
            btn.id = i++;

            btn.addEventListener('click', async() => {
                const file = await handle.getFile();
                // console.log(JSON.parse(file.text()));
                const text = await file.text();
                const json = JSON.parse(text);
                listRules(json);
            });

            ruleSetButtons.appendChild(btn);
        }
    }
});

const listRules = async (json) => {
    ruleNameButtons.textContent = '';
    const resources = json['resources']
    for (const resource of resources) {
        const displayName = resource['properties']['displayName']
        console.log(displayName)
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = buttonStyle;
        btn.textContent  = displayName
        // btn.addEventListener('click', async() => {
        //     openEditor();
        // });
        
        btn.dataset.modalTarget = 'authentication-modal';
        btn.dataset.modalToggle = 'authentication-modal';
        
        ruleNameButtons.appendChild(btn);
    }

    if (window.initFlowbite) {
        window.initFlowbite();
    }
}