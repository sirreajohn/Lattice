import { json } from '@sveltejs/kit';
import { db, initDb } from '$lib/server/db.js';
import { env } from '$env/dynamic/public';

/** @param {import('@sveltejs/kit').RequestEvent} event */
export async function POST({ request, locals }) {
	try {
		const payload = await request.json();

		// Validate payload structure
		if (!payload.version || !Array.isArray(payload.boards)) {
			return json({ error: 'Invalid backup file format' }, { status: 400 });
		}

		const userId = locals.user?.id || null;
		const targetRootId = userId ? `root_${userId}` : 'default';

		// 1. Build a remap table generating fresh UUIDs to prevent collisions
		const remap = new Map();
		for (const board of payload.boards) {
			remap.set(board.id, crypto.randomUUID());
		}

		// 2. Rewrite references
		for (const board of payload.boards) {
			board.id = remap.get(board.id);

			if (board.parent_id && remap.has(board.parent_id)) {
				board.parent_id = remap.get(board.parent_id);
			} else {
				// Top level imported boards get rooted to current session context
				board.parent_id = targetRootId;
			}

			if (Array.isArray(board.nodes)) {
				for (const node of board.nodes) {
					if (node.type === 'board' && remap.has(node.id)) {
						node.id = remap.get(node.id);
					}
				}
			}
		}

		if (env.PUBLIC_DB_MODE === 'temp') {
			return json({ success: true, payload });
		}

		await initDb();

		let imported = 0;
		let skipped = 0;

		for (const board of payload.boards) {
			try {
				await db.query(`
					INSERT INTO boards (id, name, parent_id, depth, nodes, connections, drawings, user_id, updated_at)
					VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, NOW())
				`, [
					board.id,
					board.name,
					board.parent_id || null,
					board.depth || 0,
					JSON.stringify(board.nodes || []),
					JSON.stringify(board.connections || []),
					JSON.stringify(board.drawings || []),
					userId,
				]);
				imported++;
			} catch (e) {
				console.warn(`Skipped board ${board.id}:`, e);
				skipped++;
			}
		}

		return json({ success: true, imported, skipped, total: payload.boards.length });
	} catch (error) {
		console.error('Import error:', error);
		return json({ error: 'Failed to import data: ' + (error instanceof Error ? error.stack : String(error)) }, { status: 500 });
	}
}
