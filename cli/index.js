#!/usr/bin/env node
/**
 * ChainView CLI
 * 
 * A command-line tool for creating and managing Cast commands and collections
 */
const { Command } = require('commander');
const axios = require('axios');

// Create commander program
const program = new Command();

// Set API URL - default to localhost for development
const API_URL = process.env.CHAINVIEW_API_URL || 'http://localhost:3000/api';

// Program info
program
    .name('chainview')
    .description('CLI tool for sharing Cast commands')
    .version('0.1.0');

/**
 * Submit a new command
 */
program
    .command('submit')
    .description('Submit a new Cast command')
    .argument('<command>', 'The Cast command to submit')
    .option('-t, --title <title>', 'Title for the command')
    .action(async (command, options) => {
        try {
            const response = await axios.post(`${API_URL}/commands`, {
                raw: command,
                title: options.title
            });

            console.log('Command created successfully!');
            console.log(`\nPublic link: ${response.data.publicLink}`);
            console.log('\nShare this link with anyone to view the command.');
        } catch (error) {
            console.error('Error:', error.response?.data?.error || error.message);
        }
    });

/**
 * Collection commands
 */
const collectionCommand = program
    .command('collection')
    .description('Manage collections of commands');

/**
 * Create a new collection
 */
collectionCommand
    .command('create')
    .description('Create a new collection')
    .argument('<title>', 'Title for the collection')
    .option('-d, --desc <description>', 'Description for the collection')
    .action(async (title, options) => {
        try {
            const response = await axios.post(`${API_URL}/collections`, {
                title,
                description: options.desc || ''
            });

            console.log('Collection created successfully!');
            console.log(`\nPublic link: ${response.data.publicLink}`);
            console.log('\nShare this link with anyone to view the collection.');
            console.log(`\nCollection ID: ${response.data.id}`);
            console.log('Use this ID to add commands to the collection.');
        } catch (error) {
            console.error('Error:', error.response?.data?.error || error.message);
        }
    });

/**
 * Add a command to a collection
 */
collectionCommand
    .command('add')
    .description('Add a new command to a collection')
    .argument('<collection-id>', 'ID of the collection')
    .argument('<command>', 'The Cast command to add')
    .option('-t, --title <title>', 'Title for the command')
    .action(async (collectionId, command, options) => {
        try {
            const response = await axios.post(`${API_URL}/collections/${collectionId}/commands`, {
                raw: command,
                title: options.title
            });

            console.log('Command added to collection successfully!');
            console.log(`\nPublic link: ${response.data.publicLink}`);
        } catch (error) {
            console.error('Error:', error.response?.data?.error || error.message);
        }
    });

// Parse arguments
program.parse(); 