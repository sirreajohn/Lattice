import { json } from '@sveltejs/kit';
import { db, initDb } from '$lib/server/db.js';
import { env } from '$env/dynamic/public';

/** @param {import('@sveltejs/kit').RequestEvent} event */
export async function GET({ url, locals }) {
	if (env.PUBLIC_DB_MODE === 'temp') {
		return json({ error: 'Export is not available in temp mode' }, { status: 400 });
	}

	await initDb();

	try {
		const boardIdsParam = url.searchParams.get('boardIds');
		let res;

		if (boardIdsParam) {
			const requestedIds = boardIdsParam.split(',').filter(Boolean);
			if (requestedIds.length === 0) {
				return json({ error: 'No valid board IDs provided' }, { status: 400 });
			}

			let query = `
				WITH RECURSIVE lineage AS (
					SELECT * FROM boards WHERE id = ANY($1)
					UNION
					SELECT b.* FROM boards b
					INNER JOIN lineage l ON b.parent_id = l.id
				)
				SELECT * FROM lineage
			`;
			const params = [requestedIds];
			
			if (locals.user) {
				query += ' WHERE user_id = $2 OR user_id IS NULL'; 
				params.push(locals.user.id);
			}

			res = await db.query(query, params);
		} else {
			if (locals.user) {
				res = await db.query('SELECT * FROM boards WHERE user_id = $1', [locals.user.id]);
			} else {
				res = await db.query('SELECT * FROM boards');
			}
		}

		const payload = {
			version: 1,
			exportedAt: new Date().toISOString(),
			userId: locals.user?.id || null,
			boards: res.rows.map((/** @type {any} */ row) => ({
				id: row.id,
				name: row.name,
				parent_id: row.parent_id,
				depth: row.depth || 0,
				nodes: row.nodes || [],
				connections: row.connections || [],
				drawings: row.drawings || [],
			})),
		};

		const jsonStr = JSON.stringify(payload, null, 2);

		const d = new Date();
		const timeStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;

		return new Response(jsonStr, {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="Lattice_Backup_${timeStr}.lattice"`,
			},
		});
	} catch (error) {
		console.error('Export error:', error);
		return json({ error: 'Failed to export data' }, { status: 500 });
	}
}

/** @param {import('@sveltejs/kit').RequestEvent} event */
export async function POST({ request }) {
	try {
		const payload = await request.json();
		const jsonStr = JSON.stringify(payload, null, 2);

		const d = new Date();
		const timeStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;

		return new Response(jsonStr, {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="Lattice_Backup_${timeStr}.lattice"`,
			},
		});
	} catch (error) {
		console.error('Export POST error:', error);
		return json({ error: 'Failed to export data' }, { status: 500 });
	}
}
