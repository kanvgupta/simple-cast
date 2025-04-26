# ChainView

A tool for sharing [Foundry Cast](https://book.getfoundry.sh/cast/) commands with others.

## Features

- Share Cast commands via unique URLs
- Group related commands into collections
- No accounts or authentication required
- Simple CLI tool for creating and managing commands

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chainview.git
cd chainview

# Install dependencies
npm install

# Start the server
npm start
```

### Environment Variables

Create a `.env` file with the following variables:

```
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/chainview
NODE_ENV=development
```

### Database Setup

The application uses PostgreSQL. Make sure you have it installed and running.

```bash
# Create a database
createdb chainview
```

The server will automatically create the necessary tables on startup.

## CLI Usage

### Install the CLI tool

```bash
# Install globally
npm install -g .
```

### Create a Command

```bash
chainview submit "cast call --rpc-url=https://eth-mainnet.alchemyapi.io/v2/KEY 0xTOKEN 'function()' ARG" --title "My Command"
```

### Create a Collection

```bash
chainview collection create "My Collection" --desc "Collection description"
```

### Add a Command to a Collection

```bash
chainview collection add COLLECTION_ID "cast call ..." --title "New Command"
```

## API Endpoints

### Commands

- `POST /api/commands` - Create a command
- `GET /api/c/:id` - View a command

### Collections

- `POST /api/collections` - Create a collection
- `GET /api/col/:id` - View a collection
- `POST /api/collections/:id/commands` - Add a command to a collection

## Example Use Cases

### ERC20 Collection

Create a collection of common ERC20 function calls:

```bash
# Create the collection
chainview collection create "ERC20 Functions" --desc "Common ERC20 token functions"

# Add balance check command
chainview collection add <collection-id> "cast call --rpc-url=https://eth-mainnet.alchemyapi.io/v2/KEY 0x6B175474E89094C44Da98b954EedeAC495271d0F 'balanceOf(address)' 0xWALLET" --title "Check DAI Balance"

# Add allowance check command
chainview collection add <collection-id> "cast call --rpc-url=https://eth-mainnet.alchemyapi.io/v2/KEY 0x6B175474E89094C44Da98b954EedeAC495271d0F 'allowance(address,address)' 0xOWNER 0xSPENDER" --title "Check DAI Allowance"

# Add total supply command
chainview collection add <collection-id> "cast call --rpc-url=https://eth-mainnet.alchemyapi.io/v2/KEY 0x6B175474E89094C44Da98b954EedeAC495271d0F 'totalSupply()'" --title "DAI Total Supply"
```

## License

MIT
