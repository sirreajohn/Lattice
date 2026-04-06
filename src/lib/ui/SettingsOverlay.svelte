<script>
	import { themeState, PRESETS } from '$lib/state/theme.svelte.js';

	const colorKeys = [
		{ key: 'canvas', label: 'Canvas Background' },
		{ key: 'surface', label: 'Cards & Surfaces' },
		{ key: 'border', label: 'Borders & Lines' },
		{ key: 'text-primary', label: 'Primary Text' },
		{ key: 'text-secondary', label: 'Secondary Text' },
		{ key: 'accent', label: 'Accent Color' },
		{ key: 'lines', label: 'Connection Arrows' }
	];

	function handleColorChange(key, event) {
		themeState.setColor(key, event.target.value);
	}

	function handlePresetChange(event) {
		if (event.target.value !== 'custom') {
			themeState.setPreset(event.target.value);
		}
	}
</script>

{#if themeState.isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
		onclick={() => themeState.isOpen = false}
	>
		<div 
			class="w-full max-w-2xl h-[500px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl flex overflow-hidden relative"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Sidebar -->
			<div class="w-48 bg-black/20 border-r border-[var(--color-border)] flex flex-col p-2">
				<div class="px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
					Settings
				</div>
				<button class="w-full text-left px-3 py-2 rounded-md bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-medium text-sm transition-colors">
					Customization
				</button>
			</div>

			<!-- Content Area -->
			<div class="flex-1 overflow-y-auto p-8 relative">
				<button 
					class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-neutral-800 rounded transition-colors"
					onclick={() => themeState.isOpen = false}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>

				<h2 class="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Customization</h2>
				
				<div class="space-y-8">
					<!-- Colors Section -->
					<section>
						<div class="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border)]">
							<h3 class="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Colors & Themes</h3>
							
							<div class="flex items-center gap-2">
								<select 
									class="bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[var(--color-accent)] min-w-[120px]"
									value={themeState.currentPreset}
									onchange={handlePresetChange}
								>
									<option value="custom">Custom</option>
									<optgroup label="Presets">
										{#each Object.keys(PRESETS) as presetId}
											<option value={presetId}>
												{presetId.charAt(0).toUpperCase() + presetId.slice(1)}
											</option>
										{/each}
									</optgroup>
								</select>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							{#each colorKeys as {key, label}}
								<div class="flex items-center justify-between bg-[var(--color-canvas)] p-3 rounded-md border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors">
									<label for="color-{key}" class="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer select-none">
										{label}
									</label>
									<div class="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-inner flex shrink-0">
										<input 
											id="color-{key}"
											type="color" 
											value={themeState.colors[key]}
											oninput={(e) => handleColorChange(key, e)}
											class="absolute -inset-2 w-16 h-16 cursor-pointer opacity-0"
										/>
										<div 
											class="w-full h-full pointer-events-none" 
											style="background-color: {themeState.colors[key]}"
										></div>
									</div>
								</div>
							{/each}
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
{/if}
