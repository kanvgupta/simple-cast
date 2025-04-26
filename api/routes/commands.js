/**
 * Command routes
 */
const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db');
const { parseCast } = require('../../lib/parser');

const router = express.Router();

/**
 * Create a new command
 */
router.post('/', async (req, res) => {
    try {
        const { raw, title = 'Untitled Command' } = req.body;

        // Parse and validate the command
        const parsed = parseCast(raw);

        // Generate ID for public link
        const id = nanoid(10);

        // Store in database
        await db.query(
            'INSERT INTO commands (id, title, raw, rpc_url, parsed) VALUES ($1, $2, $3, $4, $5)',
            [id, title, raw, parsed.rpcUrl, JSON.stringify(parsed.parsed)]
        );

        // Return link
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const publicLink = `${baseUrl}/api/c/${id}`;

        res.status(201).json({
            id,
            title,
            publicLink
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Get a command by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT id, title, raw, rpc_url, parsed, created_at FROM commands WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Command not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 