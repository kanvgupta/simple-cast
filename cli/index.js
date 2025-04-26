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

// Set API URL - use environment variable or default to production
const API_URL = process.env.CHAINVIEW_API_URL || 'https://chainview.kanvgupta.com/api';

// Program info
program
    .name('chainview')
    .description('CLI tool for sharing blockchain commands')
    .version('0.1.0');

/**
 * Submit a new command
 */
program
    .command('submit')
    .description('Submit a new Cast command')
    .allowUnknownOption(true)
    .option('-t, --title <title>', 'Title for the command')
    .action(async (options) => {
        try {
            // Extract the cast command by handling it specially
            const args = process.argv;
            const submitIndex = args.indexOf('submit');

            if (submitIndex === -1 || submitIndex === args.length - 1) {
                throw new Error('No cast command provided');
            }

            // Find where the title option starts, if present
            let titleIndex = -1;
            for (let i = submitIndex + 1; i < args.length; i++) {
                if (args[i] === '-t' || args[i] === '--title') {
                    titleIndex = i;
                    break;
                }
            }

            // Extract the cast command - everything between 'submit' and the title option
            let castCommand;
            if (titleIndex !== -1) {
                castCommand = args.slice(submitIndex + 1, titleIndex).join(' ');
            } else {
                castCommand = args.slice(submitIndex + 1).join(' ');
            }

            // Trim any extra quotes that might have been added by the shell
            castCommand = castCommand.trim();
            if ((castCommand.startsWith('"') && castCommand.endsWith('"')) ||
                (castCommand.startsWith("'") && castCommand.endsWith("'"))) {
                castCommand = castCommand.substring(1, castCommand.length - 1);
            }

            const response = await axios.post(`${API_URL}/commands`, {
                raw: castCommand,
                title: options.title || 'Untitled Command'
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
    .allowUnknownOption(true)
    .option('-t, --title <title>', 'Title for the command')
    .action(async (collectionId, options) => {
        try {
            // Extract the cast command by handling it specially
            const args = process.argv;
            const addIndex = args.indexOf('add');
            const collectionIdIndex = addIndex + 1;

            if (addIndex === -1 || collectionIdIndex >= args.length) {
                throw new Error('Missing collection ID or cast command');
            }

            // Find where the title option starts, if present
            let titleIndex = -1;
            for (let i = collectionIdIndex + 1; i < args.length; i++) {
                if (args[i] === '-t' || args[i] === '--title') {
                    titleIndex = i;
                    break;
                }
            }

            // Extract the cast command - everything between collection ID and the title option
            let castCommand;
            if (titleIndex !== -1) {
                castCommand = args.slice(collectionIdIndex + 1, titleIndex).join(' ');
            } else {
                castCommand = args.slice(collectionIdIndex + 1).join(' ');
            }

            // Trim any extra quotes that might have been added by the shell
            castCommand = castCommand.trim();
            if ((castCommand.startsWith('"') && castCommand.endsWith('"')) ||
                (castCommand.startsWith("'") && castCommand.endsWith("'"))) {
                castCommand = castCommand.substring(1, castCommand.length - 1);
            }

            const response = await axios.post(`${API_URL}/collections/${collectionId}/commands`, {
                raw: castCommand,
                title: options.title || 'Untitled Command'
            });

            console.log('Command added to collection successfully!');
            console.log(`\nPublic link: ${response.data.publicLink}`);
        } catch (error) {
            console.error('Error:', error.response?.data?.error || error.message);
        }
    });

// Parse arguments
program.parse(); 