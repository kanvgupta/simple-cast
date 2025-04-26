/**
 * Parser for Cast commands
 */

const WALLET_FLAGS = [
    '-i', '--interactive',
    '--mnemonic-derivation-path', '--mnemonic-indexes', '--mnemonic-passphrase',
    '--mnemonic', '--private-key', '--private-keys',
    '--keystore', '--account', '--password',
    '-t', '--trezor', '-l', '--ledger',
    '-f', '--from', '--unlocked'
];

/**
 * Parse a Cast command into components
 * @param {string} rawCommand - The raw Cast command
 * @returns {Object} Parsed command data
 */
function parseCast(rawCommand) {
    if (!rawCommand.trim().startsWith('cast ')) {
        throw new Error('Command must start with "cast"');
    }

    // Extract RPC URL if present
    let rpcUrl = '';
    const rpcMatch = rawCommand.match(/--rpc-url[=\s]([^\s]+)/);
    if (rpcMatch) {
        rpcUrl = rpcMatch[1];
    }

    // Extract subcommand (e.g., "call", "send")
    const parts = rawCommand.split(' ');
    const subcommand = parts[1];

    // Check for wallet flags that might expose private keys
    const hasWalletFlags = WALLET_FLAGS.some(flag =>
        rawCommand.includes(` ${flag} `) || rawCommand.includes(` ${flag}=`)
    );

    if (hasWalletFlags) {
        throw new Error('Command contains wallet flags which may expose private keys');
    }

    return {
        rpcUrl,
        subcommand,
        raw: rawCommand,
        parsed: {
            rpcUrl,
            subcommand,
            timestamp: new Date().toISOString()
        }
    };
}

module.exports = { parseCast }; 