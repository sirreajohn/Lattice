<script>
    import { onMount, tick } from 'svelte';
    import { nodesState } from '$lib/state/nodes.svelte.js';
    import { browser } from '$app/environment';

    /** @type {{ node: any, baseElement?: HTMLDivElement }} */
    let { node, baseElement } = $props();
    
    let nodeType = $derived(node.data?.type || 'html');
    /** @type {HTMLDivElement|undefined} */
    let editorContainer = $state();
    /** @type {HTMLDivElement|undefined} */
    let pptxContainer = $state();
    /** @type {any} */
    let quillInstance = $state(null);

    async function downloadDocument() {
        if (!browser) return;
        const title = node.data?.title || typeLabels[nodeType] || 'document';
        const content = node.data?.content;

        if (nodeType === 'html') {
            const html = quillInstance ? quillInstance.getSemanticHTML() : content;
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.html`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (content) {
            // PDF or Presentation (base64/dataURL)
            const a = document.createElement('a');
            a.href = content;
            const ext = nodeType === 'pdf' ? 'pdf' : 'pptx';
            a.download = `${title}.${ext}`;
            a.click();
        }
    }

    onMount(async () => {
        if (!browser) return;
        await tick();

        // Initialize based on node type
        if (nodeType === 'html' && editorContainer) {
            // Dynamically inject Quill CSS (only once)
            if (!document.getElementById('quill-snow-css')) {
                const link = document.createElement('link');
                link.id = 'quill-snow-css';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css';
                document.head.appendChild(link);
                await new Promise(r => setTimeout(r, 100));
            }

            const { default: Quill } = await import('quill');
            quillInstance = new Quill(editorContainer, {
                theme: 'snow',
                placeholder: 'Start typing your document...',
                modules: {
                    toolbar: [
                        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        ['blockquote', 'code-block'],
                        ['link', 'image'],
                        [{ 'direction': 'rtl' }],
                        ['clean']
                    ]
                }
            });

            const initialContent = node.data?.content || '';
            if (initialContent) {
                const delta = quillInstance.clipboard.convert({ html: initialContent });
                quillInstance.setContents(delta, 'silent');
            }

            /** @type {any} */
            let timeout;
            quillInstance.on('text-change', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (quillInstance) {
                        const html = quillInstance.getSemanticHTML();
                        node.data = { ...node.data, type: 'html', content: html };
                        nodesState.saveToStorage();
                    }
                }, 500);
            });
        } else if (nodeType === 'presentation' && pptxContainer) {
            try {
                const { init } = await import('pptx-preview');
                const dataUrl = node.data?.content;
                if (dataUrl) {
                    const containerWidth = pptxContainer.clientWidth || 500;
                    const viewer = init(pptxContainer, {
                        width: containerWidth,
                        mode: 'list'
                    });
                    // Convert data URL to ArrayBuffer for pptx-preview
                    const res = await fetch(dataUrl);
                    const arrayBuffer = await res.arrayBuffer();
                    await viewer.preview(arrayBuffer);
                }
            } catch (e) {
                console.error('PPTX preview error:', e);
                if (pptxContainer) {
                    pptxContainer.innerHTML = `<div style="padding:24px;color:#999;">Failed to render presentation. ${e?.message || ''}</div>`;
                }
            }
        }
    });

    const typeLabels = { html: 'Document', pdf: 'PDF', presentation: 'Presentation' };
    const typeIcons = {
        html: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z',
        pdf: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z',
        presentation: 'M2 3h20v14H2zM12 17v4M8 21h8'
    };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="w-full h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden text-black" 
     onpointerdown={(e) => {
         if (nodeType !== 'pdf') e.stopPropagation();
     }}>
    <!-- Label header -->
    <div class="h-8 border-b flex items-center px-3 shrink-0 pointer-events-auto gap-2
        {nodeType === 'presentation' ? 'bg-orange-50 border-orange-200' : 
         'bg-gray-100 border-gray-200'}">
        
        <div class="flex items-center gap-1.5 shrink-0
            {nodeType === 'presentation' ? 'text-orange-600' : 
             'text-gray-500'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d={typeIcons[nodeType] || typeIcons.html}/>
            </svg>
            <span class="text-[10px] font-semibold uppercase tracking-wider hidden sm:inline">
                {typeLabels[nodeType] || 'Document'}
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
            placeholder="Untitled {typeLabels[nodeType] || 'Document'}..."
            class="flex-1 bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-current placeholder:opacity-40 {nodeType === 'presentation' ? 'text-orange-900' : 'text-gray-900'}"
        />

        <button 
            onclick={downloadDocument}
            class="p-1 rounded hover:bg-black/5 transition-colors shrink-0 {nodeType === 'presentation' ? 'text-orange-600' : 'text-gray-500'}"
            title="Download to local device"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden relative nodrag pointer-events-auto bg-white select-text" onwheel={(e) => e.stopPropagation()}>
        {#if nodeType === 'pdf'}
            <iframe 
                src={node.data?.content || ''} 
                class="w-full h-full border-none bg-white"
                title="PDF Document"
            ></iframe>
        {:else if nodeType === 'presentation'}
            <!-- PPTX Viewer -->
            <div bind:this={pptxContainer} class="w-full h-full overflow-auto p-4 bg-gray-100 pptx-viewer"></div>
        {:else}
            <!-- Quill Rich Text Editor -->
            <div bind:this={editorContainer} class="docs-editor-root"></div>
        {/if}
    </div>
</div>

<style>
    .docs-editor-root {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    :global(.ql-toolbar.ql-snow) {
        border: none !important;
        border-bottom: 1px solid #e5e7eb !important;
        background: #f9fafb;
        flex-shrink: 0;
    }
    :global(.ql-container.ql-snow) {
        border: none !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        flex: 1;
        overflow-y: auto;
    }
    :global(.ql-editor) {
        padding: 24px 28px;
        font-size: 14px;
        line-height: 1.7;
    }
    :global(.ql-editor.ql-blank::before) {
        color: #9ca3af;
        font-style: normal;
    }

    /* PPTX viewer overrides */
    .pptx-viewer :global(.slide) {
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        border-radius: 4px;
        overflow: hidden;
    }
</style>
