# Splook

Splook is a lightweight Solana wallet sniffer that checks SOL balance and token accounts from any Solana address — with real-time token metadata lookup baked right in.
Just throw addresses at it, and it spits out the good stuff.

> Built for devs, skimmers, treasure hunters.

---

## Features

Fetch SOL balance

Fetch token accounts (SPL tokens)

Read token name and symbol via on-chain metadata

Clean CLI output

Mainnet ready (uses https://api.mainnet-beta.solana.com)

Zero dependencies outside Solana web3

---

## Installation

git clone https://github.com/victoryosiobe/splook.git
cd splook
yarn

or

npm install

---

## Usage

```commands
node .
node index.js
npm start
yarn start
```

You'll see:

🚀 Enter Solana wallet addresses (Ctrl+C to stop):

Type or paste Solana addresses, one by one.

Example output:

🔹 Wallet: 4Nd1mNkJtZ7Wk6XX...
🔗 SOLscan: https://solscan.io/account/4Nd1mNkJtZ7Wk6XX...
💰 SOL Balance: 0.872319000000000 SOL

🎉 Tokens:

1. Mint: So11111111111111111111111111111111111111112 (Wrapped SOL - wSOL)
   Amount: 0.5 (9 decimals)
2. Mint: ABCDEFG12345...(Bonk Inu - BONK)
   Amount: 1,230,000 (5 decimals)

---

## How It Works

SOL Balance: Calls getBalance and converts from lamports.

Tokens: Fetches all token accounts owned by the address.

Token Metadata: Calculates metadata PDA manually and parses raw bytes (no external APIs).

CLI: Takes input from stdin line-by-line.

---

## Requirements

Node.js 18+

Yarn or npm

Internet (obviously, it’s Solana Mainnet, haha)

---

## Nerdy Bits

No API keys required. Public RPC.

Manual PDA calculation, not using metaplex/js.

Handles unknown tokens gracefully.

Low RAM usage — runs fine on mobile Termux or laptops with potatoes inside.
