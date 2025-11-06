// Solana Web3 & Token Metadata imports
const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const readline = require("readline");

// Solana RPC connection
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

// CLI setup for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fetch wallet's SOL balance
async function getSolBalance(address) {
  const balance = await connection.getBalance(new PublicKey(address));
  return balance / 1e9; // Convert lamports to SOL
}

// Fetch all token accounts linked to the wallet
async function getTokenAccounts(address) {
  const publicKey = new PublicKey(address);
  const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });

  return accounts.value.map((account) => {
    const info = account.account.data.parsed.info;
    return {
      mint: info.mint,
      amount: info.tokenAmount.uiAmount,
      decimals: info.tokenAmount.decimals,
    };
  });
}

// Calculate Token Metadata PDA manually
function getMetadataPda(mintAddress) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(mintAddress).toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}

// Improved metadata parsing — handles symbol length properly
function parseMetadata(data) {
  try {
    // Skip unnecessary bytes (1 byte key, 32 bytes update authority, 32 bytes mint)
    let offset = 1 + 32 + 32;

    // Read token name (32 bytes) — trim null bytes
    const name = data
      .slice(offset, offset + 32)
      .toString("utf8")
      .replace(/\0/g, "")
      .trim();
    offset += 32;

    // Read symbol — now fully supports longer symbols!
    const symbol = data
      .slice(offset, offset + 10)
      .toString("utf8")
      .replace(/\0/g, "")
      .trim();
    offset += 10;

    // Read optional URI (200 bytes)
    const uri = data
      .slice(offset, offset + 200)
      .toString("utf8")
      .replace(/\0/g, "")
      .trim();

    return { name: name || "Unknown Token", symbol: symbol || "???" };
  } catch (error) {
    console.error(`⚠️ Metadata parsing error: ${error.message}`);
    return { name: "Unknown Token", symbol: "???" };
  }
}

// Fetch token metadata (name and symbol)
async function getTokenMetadata(mintAddress) {
  try {
    const metadataPda = getMetadataPda(mintAddress);
    const accountInfo = await connection.getAccountInfo(metadataPda);

    if (!accountInfo) return { name: "Unknown Token", symbol: "???" };

    // Parse metadata data properly (no clipping!)
    const { name, symbol } = parseMetadata(accountInfo.data);
    return { name, symbol };
  } catch (error) {
    console.error(
      `❌ Error fetching metadata for mint ${mintAddress}:`,
      error.message,
    );
    return { name: "Unknown Token", symbol: "???" };
  }
}

// Display wallet info neatly
async function checkWallet(address) {
  try {
    console.log(`\nWallet: ${address}`);
    console.log(` | Solscan: https://solscan.io/account/${address}`);

    const solBalance = await getSolBalance(address);
    console.log(` | SOL Balance: ${solBalance.toFixed(15)} SOL`);

    const tokens = await getTokenAccounts(address);

    if (tokens.length === 0) {
      console.log(" | No tokens found.");
    } else {
      console.log("\n | Tokens:");
      for (const [index, token] of tokens.entries()) {
        const { name, symbol } = await getTokenMetadata(token.mint);
        console.log(
          ` | ${index + 1}. Mint: ${token.mint} (${name} - ${symbol})\n   Amount: ${token.amount.toLocaleString()} (${token.decimals} decimals)`,
        );
      }
    }
  } catch (error) {
    console.error(`❌ Error checking wallet ${address}:`, error.message);
  }
}

// Read wallets from stdin
console.log("Enter Solana wallet addresses (Ctrl+C to stop):");
rl.on("line", (address) => {
  if (address.trim()) {
    checkWallet(address.trim());
  }
});
