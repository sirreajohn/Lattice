import { supabase } from '$lib/supabase.js';
import { authState } from '$lib/state/auth.svelte.js';
import { env } from '$env/dynamic/public';

const DEBOUNCE_MS = parseInt(env.PUBLIC_DEBOUNCE_TIMEOUT_MS || '5000', 10);
const MAX_CARDS = parseInt(env.PUBLIC_MAX_CARDS_PER_BOARD || '500', 10);
const STORAGE_MODE = env.PUBLIC_STORAGE_MODE || 'local';

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export class NodesState {
	// Array of nodes: { id, type, x, y, width, height, data }
	nodes = $state([]);
	// Array of connections: { id, from: nodeId, to: nodeId }
	connections = $state([]);
	
	// Networking state
	syncStatus = $state('synced'); // 'synced', 'saving', 'error'

	// Draft connection for drawing lines
	draftConnection = $state(null);

	// Selected node id
	selectedNodeId = $state(null);
	boardId = '';

	constructor(boardId = 'default') {
		this.boardId = boardId;
		this.loadFromStorage();
	}

	addNode(type, x, y, data = {}) {
		if (this.nodes.length >= MAX_CARDS) {
			alert(`Board limit reached: maximum of ${MAX_CARDS} cards allowed.`);
			return null;
		}
		const id = crypto.randomUUID();
		this.nodes.push({ id, type, x, y, parentId: null, width: 250, height: "auto", data });
		this.saveToStorage();
		return id;
	}

	updateNodePosition(id, x, y) {
		const node = this.nodes.find(n => n.id === id);
		if (node) {
			node.x = x;
			node.y = y;
			this.saveToStorage();
		}
	}

	updateNodeData(id, data) {
		const node = this.nodes.find(n => n.id === id);
		if (node) {
			node.data = { ...node.data, ...data };
			this.saveToStorage();
		}
	}

	updateNodeParent(id, parentId) {
		const node = this.nodes.find(n => n.id === id);
		if (node) {
			node.parentId = parentId;
			
			// Remove any existing direct connections between this node and its new parent deck
			if (parentId) {
				this.connections = this.connections.filter(c => 
					!(c.from === id && c.to === parentId) && 
					!(c.to === id && c.from === parentId)
				);
			}

			this.saveToStorage();
		}
	}

	removeNode(id) {
		this.nodes = this.nodes.filter(n => n.id !== id);
		this.connections = this.connections.filter(c => c.from !== id && c.to !== id);
		if (this.selectedNodeId === id) this.selectedNodeId = null;
		this.saveToStorage();
	}

	addConnection(fromId, fromPort, toId, toPort) {
		const fromNode = this.nodes.find(n => n.id === fromId);
		const toNode = this.nodes.find(n => n.id === toId);

		// Prevent connections between a deck and its direct children
		if (fromNode?.parentId === toId || toNode?.parentId === fromId) return;

		// Force max 1 wire per specific port socket to prevent spaghetti limits
		if (this.connections.some(c => 
			(c.from === fromId && c.fromPort === fromPort) ||
			(c.to === fromId && c.toPort === fromPort) ||
			(c.from === toId && c.fromPort === toPort) ||
			(c.to === toId && c.toPort === toPort)
		)) return;

		this.connections.push({ id: crypto.randomUUID(), from: fromId, fromPort, to: toId, toPort });
		this.saveToStorage();
	}

	removeConnection(id) {
		this.connections = this.connections.filter(c => c.id !== id);
		this.saveToStorage();
	}

	updateConnectionLabel(id, label) {
		const conn = this.connections.find(c => c.id === id);
		if (conn) {
			conn.label = label;
			this.saveToStorage();
		}
	}

	async loadFromStorage() {
		try {
			if (typeof window !== 'undefined') {
				if (STORAGE_MODE === 'local') {
					const savedNodes = localStorage.getItem(`lattice-${this.boardId}-nodes`);
					const savedConnections = localStorage.getItem(`lattice-${this.boardId}-connections`);
					if (savedNodes) this.nodes = JSON.parse(savedNodes);
					if (savedConnections) this.connections = JSON.parse(savedConnections);
					return;
				}

				// Cloud mode load
				const { data, error } = await supabase
					.from('boards')
					.select('*')
					.eq('id', this.boardId)
					.single();

				if (data) {
					// Use JSON parse trick to avoid SvelteKit reactive proxy bleed
					if (data.nodes) this.nodes = JSON.parse(JSON.stringify(data.nodes));
					if (data.connections) this.connections = JSON.parse(JSON.stringify(data.connections));
					
					// Tell global metadata about the loaded name
					globalMetadata.setName(this.boardId, data.name || `board_${this.boardId.slice(0,6)}`);
				} else if (error && error.code === 'PGRST116') {
					// 0 rows found: Create it
					// Bundle owner_id if signed in so RLS accepts it
					const newBoard = { 
						id: this.boardId, 
						name: `board_${this.boardId.slice(0,6)}`, 
						nodes: this.nodes, 
						connections: this.connections 
					};
					if (authState.currentUser) {
						newBoard.owner_id = authState.currentUser.id;
					}
					await supabase.from('boards').insert(newBoard);
				}
			}
		} catch (e) {
			console.error("Failed to load lattice state:", e);
		}
	}

	saveToStorage = debounce(async () => {
		try {
			if (typeof window !== 'undefined') {
				if (STORAGE_MODE === 'local') {
					localStorage.setItem(`lattice-${this.boardId}-nodes`, JSON.stringify(this.nodes));
					localStorage.setItem(`lattice-${this.boardId}-connections`, JSON.stringify(this.connections));
					return;
				}

				// Cloud mode save
				this.syncStatus = 'saving';
				const rawNodes = JSON.parse(JSON.stringify(this.nodes));
				const rawConnections = JSON.parse(JSON.stringify(this.connections));

				let { error } = await supabase
					.from('boards')
					.update({ nodes: rawNodes, connections: rawConnections, updated_at: new Date().toISOString() })
					.eq('id', this.boardId);
					
				if (error) throw error;
				this.syncStatus = 'synced';
			}
		} catch (e) {
			console.error("Failed to save lattice state:", e);
			this.syncStatus = 'error';
		}
	}, DEBOUNCE_MS);
}

export const nodesState = new NodesState();

export class GlobalMetadata {
	boardNames = $state({});

	constructor() {
		if (typeof window !== 'undefined') {
			this.boardNames = JSON.parse(localStorage.getItem('lattice-board-names') || '{}');
		}
	}

	setName(id, name) {
		this.boardNames[id] = name;
		if (typeof window !== 'undefined') {
			localStorage.setItem('lattice-board-names', JSON.stringify(this.boardNames));
			// Sync backward to supabase if it's the current board and we are in cloud mode
			if (STORAGE_MODE === 'cloud' && nodesState.boardId === id) {
				supabase.from('boards').update({ name, updated_at: new Date().toISOString() }).eq('id', id).then();
			}
		}
	}

	getName(id) {
		return this.boardNames[id] || `board_${id.slice(0,6)}`;
	}
}

export const globalMetadata = new GlobalMetadata();
