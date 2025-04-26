/**
 * Collection routes
 */
const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db');

const router = express.Router();

/**
 * Create a new collection
 */
router.post('/', async (req, res) => {
    try {
        const { title, description = '' } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Generate ID for public link
        const id = nanoid(10);

        // Store in database
        await db.query(
            'INSERT INTO collections (id, title, description) VALUES ($1, $2, $3)',
            [id, title, description]
        );

        // Return link
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const publicLink = `${baseUrl}/api/col/${id}`;

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
 * Get a collection by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get collection details
        const collectionResult = await db.query(
            'SELECT id, title, description, created_at FROM collections WHERE id = $1',
            [id]
        );

        if (collectionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Get commands in this collection
        const commandsResult = await db.query(
            'SELECT id, title, raw, rpc_url, created_at FROM commands WHERE collection_id = $1 ORDER BY created_at',
            [id]
        );

        // Combine collection with its commands
        const collection = {
            ...collectionResult.rows[0],
            commands: commandsResult.rows
        };

        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Add a command to a collection
 */
router.post('/:id/commands', async (req, res) => {
    try {
        const { id } = req.params;
        const { raw, title = 'Untitled Command' } = req.body;

        // Verify collection exists
        const collectionResult = await db.query(
            'SELECT id FROM collections WHERE id = $1',
            [id]
        );

        if (collectionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Parse and validate the command
        const { parseCast } = require('../../lib/parser');
        const parsed = parseCast(raw);

        // Generate ID for command
        const commandId = nanoid(10);

        // Store in database
        await db.query(
            'INSERT INTO commands (id, title, raw, rpc_url, parsed, collection_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [commandId, title, raw, parsed.rpcUrl, JSON.stringify(parsed.parsed), id]
        );

        // Return link
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const publicLink = `${baseUrl}/api/c/${commandId}`;

        res.status(201).json({
            id: commandId,
            title,
            publicLink,
            collectionId: id
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 