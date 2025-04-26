/**
 * View routes for commands and collections
 */
const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * View a command by ID
 */
router.get('/c/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT id, title, raw, rpc_url, parsed, collection_id, created_at FROM commands WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Command not found' });
        }

        // Get collection info if part of a collection
        let collection = null;
        if (result.rows[0].collection_id) {
            const collectionResult = await db.query(
                'SELECT id, title FROM collections WHERE id = $1',
                [result.rows[0].collection_id]
            );
            if (collectionResult.rows.length > 0) {
                collection = collectionResult.rows[0];
            }
        }

        // Format the response
        const command = {
            ...result.rows[0],
            collection
        };

        // For HTML request, render a nice page
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            res.send(commandHtml(command));
        } else {
            // For API requests, return JSON
            res.json(command);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * View a collection by ID
 */
router.get('/col/:id', async (req, res) => {
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

        // Format the response
        const collection = {
            ...collectionResult.rows[0],
            commands: commandsResult.rows
        };

        // For HTML request, render a nice page
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            res.send(collectionHtml(collection));
        } else {
            // For API requests, return JSON
            res.json(collection);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * HTML template for command display
 */
function commandHtml(command) {
    // Extract parameters with -- flags
    const extractParams = (cmd) => {
        const params = [];
        const regex = /--([a-zA-Z0-9_-]+)(?:[=\s]([^\s"']+|"[^"]*"|'[^']*'))?/g;
        let match;

        while ((match = regex.exec(cmd)) !== null) {
            let paramName = match[1];
            let paramValue = match[2] || '';

            // Remove quotes if present
            if (paramValue.startsWith('"') && paramValue.endsWith('"') ||
                paramValue.startsWith("'") && paramValue.endsWith("'")) {
                paramValue = paramValue.substring(1, paramValue.length - 1);
            }

            params.push({ name: paramName, value: paramValue });
        }

        return params;
    };

    const params = extractParams(command.raw);

    // Generate form fields for parameters
    const paramFields = params.map(param => `
        <div class="param-field">
            <label for="${param.name}">--${param.name}</label>
            <input type="text" id="${param.name}" name="${param.name}" value="${param.value}" 
                   data-param-name="${param.name}" class="param-input">
        </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${command.title || 'Cast Command'} - ChainView</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
      color: #333;
    }
    header {
      margin-bottom: 2rem;
    }
    h1 {
      margin-bottom: 0.5rem;
    }
    .created {
      color: #666;
      font-size: 0.9rem;
    }
    .command-box {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 1rem;
      margin: 1.5rem 0;
      overflow-x: auto;
    }
    .command {
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .copy-btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #0066ff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .copy-btn:hover {
      background: #0055dd;
    }
    .collection-link {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    .param-form {
      margin: 2rem 0;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #eee;
    }
    .param-form h3 {
      margin-top: 0;
    }
    .param-field {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
    }
    .param-field label {
      margin-bottom: 0.3rem;
      font-weight: bold;
      font-family: monospace;
    }
    .param-input {
      padding: 0.5rem;
      font-family: monospace;
      border: 1px solid #ddd;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <header>
    <h1>${command.title || 'Cast Command'}</h1>
    <div class="created">Created on ${new Date(command.created_at).toLocaleString()}</div>
  </header>
  
  <div class="param-form">
    <h3>Edit Command Parameters</h3>
    <form id="paramsForm">
      ${paramFields}
    </form>
  </div>
  
  <div class="command-box">
    <div class="command" id="commandDisplay">${command.raw}</div>
  </div>
  
  <button class="copy-btn" id="copyBtn">
    Copy to Clipboard
  </button>
  
  ${command.collection ?
            `<div class="collection-link">
      Part of collection: <a href="/api/col/${command.collection.id}">${command.collection.title}</a>
    </div>` : ''}
    
  <script>
    // Original command for reset
    const originalCommand = \`${command.raw.replace(/`/g, '\\`')}\`;
    
    // Update displayed command when parameters change
    const inputs = document.querySelectorAll('.param-input');
    const commandDisplay = document.getElementById('commandDisplay');
    const copyBtn = document.getElementById('copyBtn');
    
    function updateCommand() {
      let updatedCommand = originalCommand;
      
      // Apply each parameter change
      inputs.forEach(input => {
        const paramName = input.dataset.paramName;
        const pattern = new RegExp(\`--\${paramName}(?:[=\\s]([^\\s"']+|"[^"]*"|'[^']*'))\`, 'g');
        
        // If value has spaces, wrap in quotes
        let value = input.value;
        if (value.includes(' ') && !value.match(/^["'].*["']$/)) {
          value = \`"\${value}"\`;
        }
        
        updatedCommand = updatedCommand.replace(pattern, \`--\${paramName}=\${value}\`);
      });
      
      commandDisplay.textContent = updatedCommand;
    }
    
    // Add event listeners
    inputs.forEach(input => {
      input.addEventListener('input', updateCommand);
    });
    
    // Copy button
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(commandDisplay.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy to Clipboard';
      }, 2000);
    });
    
    // Initialize
    updateCommand();
  </script>
</body>
</html>`;
}

/**
 * HTML template for collection display
 */
function collectionHtml(collection) {
    const commandsHtml = collection.commands.map(cmd => `
    <li>
      <a href="/api/c/${cmd.id}">${cmd.title || 'Untitled Command'}</a>
      <div class="command-preview">${cmd.raw}</div>
    </li>
  `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${collection.title} - ChainView</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
      color: #333;
    }
    header {
      margin-bottom: 2rem;
    }
    h1 {
      margin-bottom: 0.5rem;
    }
    .created {
      color: #666;
      font-size: 0.9rem;
    }
    .description {
      margin: 1rem 0;
      color: #444;
    }
    .commands-list {
      list-style: none;
      padding: 0;
      margin: 2rem 0;
    }
    .commands-list li {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .commands-list li:last-child {
      border-bottom: none;
    }
    .command-preview {
      font-family: monospace;
      background: #f5f5f5;
      padding: 0.75rem;
      margin-top: 0.5rem;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <header>
    <h1>${collection.title}</h1>
    <div class="created">Created on ${new Date(collection.created_at).toLocaleString()}</div>
  </header>
  
  ${collection.description ? `<div class="description">${collection.description}</div>` : ''}
  
  <h2>Commands (${collection.commands.length})</h2>
  <ul class="commands-list">
    ${commandsHtml}
  </ul>
</body>
</html>`;
}

module.exports = router; 