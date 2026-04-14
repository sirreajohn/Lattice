<script>
    import { onMount, tick } from 'svelte';
    import { nodesState } from '$lib/state/nodes.svelte.js';
    import { browser } from '$app/environment';

    /** @type {{ node: any }} */
    let { node } = $props();
    
    function getInitialSheetData() {
        const content = node.data?.content;
        if (content && content.sheets) {
            return { ...content }; // Deep clone to avoid proxying the parent reference directly? Just spread is enough.
        }
        return {
            sheets: { 'Sheet1': Array.from({ length: 15 }, () => Array(8).fill('')) },
            sheetNames: ['Sheet1'],
            activeSheet: 0
        };
    }
    
    // Spreadsheet state
    /** @type {{ sheets: Record<string, string[][]>, sheetNames: string[], activeSheet: number }} */
    let sheetData = $state(getInitialSheetData());
    let activeName = $derived(sheetData.sheetNames[sheetData.activeSheet]);
    let activeRows = $derived(sheetData.sheets[activeName] || Array.from({ length: 5 }, () => Array(5).fill('')));

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let saveTimeout;
    
    function handleInputDebounced() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveSpreadsheet, 500);
    }

    function addRow() {
        const name = sheetData.sheetNames[sheetData.activeSheet];
        const cols = activeRows[0]?.length || 5;
        sheetData.sheets[name] = [...sheetData.sheets[name], Array(cols).fill('')];
        saveSpreadsheet();
    }

    function addCol() {
        const name = sheetData.sheetNames[sheetData.activeSheet];
        sheetData.sheets[name] = sheetData.sheets[name].map(row => [...row, '']);
        saveSpreadsheet();
    }

    function addSheet() {
        const nextNum = sheetData.sheetNames.length + 1;
        const name = `Sheet${nextNum}`;
        sheetData.sheetNames.push(name);
        sheetData.sheets[name] = Array.from({ length: 15 }, () => Array(8).fill(''));
        sheetData.activeSheet = sheetData.sheetNames.length - 1;
        saveSpreadsheet();
    }

    function deleteSheet(i) {
        if (sheetData.sheetNames.length <= 1) return;
        const name = sheetData.sheetNames[i];
        if (confirm(`Delete sheet "${name}"?`)) {
            sheetData.sheetNames.splice(i, 1);
            delete sheetData.sheets[name];
            if (sheetData.activeSheet >= sheetData.sheetNames.length) {
                sheetData.activeSheet = sheetData.sheetNames.length - 1;
            }
            saveSpreadsheet();
        }
    }

    function saveSpreadsheet() {
        if (saveTimeout) clearTimeout(saveTimeout);
        // Deep clone to ensure Svelte 5 prop reactivity triggers correctly on the parent
        node.data = { ...node.data, type: 'spreadsheet', content: JSON.parse(JSON.stringify(sheetData)) };
        nodesState.saveToStorage();
    }

    async function downloadDocument() {
        if (!browser) return;
        const title = node.data?.title || 'Spreadsheet';
        const { utils, writeFile } = await import('xlsx');
        const wb = utils.book_new();
        for (const name of sheetData.sheetNames) {
            const ws = utils.aoa_to_sheet(sheetData.sheets[name]);
            utils.book_append_sheet(wb, ws, name);
        }
        writeFile(wb, `${title}.xlsx`);
    }


</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="w-full h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden text-black" 
     onpointerdown={(e) => {
         e.stopPropagation();
     }}>
    <!-- Label header -->
    <div class="h-8 border-b flex items-center px-3 shrink-0 pointer-events-auto gap-2 bg-emerald-50 border-emerald-200">
        <div class="flex items-center gap-1.5 shrink-0 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/>
            </svg>
            <span class="text-[10px] font-semibold uppercase tracking-wider hidden sm:inline">
                Spreadsheet
            </span>
        </div>

        <div class="h-4 w-px bg-current opacity-20 shrink-0"></div>

        <input 
            type="text"
            value={node.data?.title || ''}
            oninput={(e) => {
                node.data = { ...node.data, title: e.currentTarget.value };
                nodesState.saveToStorage();
            }}
            placeholder="Untitled Spreadsheet..."
            class="flex-1 bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-current placeholder:opacity-40 text-emerald-900"
        />

        <button 
            onclick={downloadDocument}
            class="p-1 rounded hover:bg-black/5 transition-colors shrink-0 text-emerald-600"
            title="Download Excel file"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden relative nodrag pointer-events-auto bg-white select-text" onwheel={(e) => e.stopPropagation()}>
        <div class="w-full h-full overflow-auto">
            <table class="spreadsheet-table">
                <thead>
                    <tr>
                        <th class="row-header"></th>
                        {#each activeRows[0] || [] as _, ci}
                            <th>{String.fromCharCode(65 + ci)}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each activeRows as row, ri}
                        <tr>
                            <td class="row-header">{ri + 1}</td>
                            {#each row as cell, ci}
                                <td 
                                    contenteditable="true"
                                    bind:textContent={sheetData.sheets[activeName][ri][ci]}
                                    oninput={handleInputDebounced}
                                    class="spreadsheet-cell"
                                ></td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Spreadsheet Footer: tabs + add row/col -->
    <div class="h-7 bg-emerald-50 border-t border-emerald-200 flex items-center shrink-0 pointer-events-auto">
        <div class="flex-1 overflow-x-auto sheet-tabs-scroll flex items-center gap-0.5 px-1.5">
            {#each sheetData.sheetNames as name, i}
                <div class="flex items-center gap-0 group/tab">
                    <button 
                        onclick={() => { sheetData.activeSheet = i; }}
                        class="text-[10px] px-2 py-0.5 rounded-l transition-colors {sheetData.activeSheet === i ? 'bg-emerald-500 text-white font-semibold' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'}"
                        class:rounded-r={sheetData.sheetNames.length <= 1 || sheetData.activeSheet !== i}
                    >{name}</button>
                    {#if sheetData.sheetNames.length > 1 && sheetData.activeSheet === i}
                        <button 
                            onclick={(e) => { e.stopPropagation(); deleteSheet(i); }}
                            class="text-[10px] px-1 py-0.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-r transition-colors border-l border-emerald-400/30"
                            title="Delete sheet"
                        >
                            ×
                        </button>
                    {/if}
                </div>
            {/each}
            <button 
                onclick={addSheet}
                class="text-[10px] px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-colors shrink-0 font-bold"
                title="Add new sheet"
            >+</button>
        </div>
        <div class="flex gap-0.5 px-1.5 shrink-0 border-l border-emerald-200">
            <button onclick={addRow} class="text-[10px] px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-colors" title="Add row">+ Row</button>
            <button onclick={addCol} class="text-[10px] px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-colors" title="Add column">+ Col</button>
        </div>
    </div>
</div>

<style>
    /* Spreadsheet styles */
    .spreadsheet-table {
        border-collapse: collapse;
        width: max-content;
        min-width: 100%;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .spreadsheet-table th {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        color: #6b7280;
        text-align: center;
        position: sticky;
        top: 0;
        z-index: 1;
        min-width: 80px;
    }
    .row-header {
        background: #f3f4f6 !important;
        border: 1px solid #d1d5db !important;
        padding: 2px 6px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #6b7280 !important;
        text-align: center !important;
        width: 36px;
        min-width: 36px;
        max-width: 36px;
    }
    .spreadsheet-cell {
        border: 1px solid #e5e7eb;
        padding: 3px 6px;
        min-width: 80px;
        min-height: 24px;
        outline: none;
        transition: background-color 0.1s;
    }
    .spreadsheet-cell:focus {
        background: #eff6ff;
        border-color: #3b82f6;
        box-shadow: inset 0 0 0 1px #3b82f6;
    }

    .sheet-tabs-scroll {
        scrollbar-width: none;
    }
    .sheet-tabs-scroll::-webkit-scrollbar {
        display: none;
    }
</style>
