#!/usr/bin/env node
/**
 * Polymarket Trading Bot - Base Network
 * 
 * Usage:
 *   node polymarket-bot.js generate    - Create new wallet
 *   node polymarket-bot.js address      - Show wallet address
 *   node polymarket-bot.js balance      - Check USDC/ETH balance
 *   node polymarket-bot.js fund         - Show funding instructions
 *   node polymarket-bot.js trade <marketId> <outcome> <amount> - Place trade
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  // Base network
  network: 'base',
  rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  
  // Tokens
  usdcAddress: '0x833589fCD6eDb6E08f4c7C32Da4CD5503b667745', // Base USDC
  
  // Polymarket contracts (Conditional Tokens)
  ctfAddress: '0x4D97EBd981c885a725b1dE41E16dB7A67Ee26e809',
  exchangeAddress: '0x29c439E6cC4F8cF1E5fF85d8C7aC3b7cF3c3f3C3', // placeholder
  
  // Files
  walletFile: path.join(__dirname, '.wallet-encrypted.json')
};

// Store encrypted wallet
function saveWallet(wallet, password) {
  const encrypted = {
    address: wallet.address,
    encryptedJson: wallet.encrypt(password)
  };
  fs.writeFileSync(CONFIG.walletFile, JSON.stringify(encrypted, null, 2));
  console.log(`✅ Wallet saved to ${CONFIG.walletFile}`);
}

// Load wallet from encrypted file
async function loadWallet(password) {
  if (!fs.existsSync(CONFIG.walletFile)) {
    throw new Error('No wallet found. Run "generate" first.');
  }
  
  const data = JSON.parse(fs.readFileSync(CONFIG.walletFile));
  const wallet = ethers.Wallet.fromEncryptedJson(data.encryptedJson, password);
  return wallet.connect(new ethers.JsonRpcProvider(CONFIG.rpcUrl));
}

// Generate new wallet
async function generateWallet() {
  console.log('🔐 Generating new Base wallet...\n');
  
  const wallet = ethers.Wallet.createRandom();
  
  console.log(`📍 Address: ${wallet.address}`);
  console.log(`🔑 Private Key: ${wallet.privateKey}`);
  console.log('');
  
  console.log('⚠️  IMPORTANT: Store this private key safely!');
  console.log('   You will need it to recover funds if files are lost.\n');
  
  // Ask for password to encrypt
  const password = process.env.WALLET_PASSWORD || 'change-this-password';
  
  saveWallet(wallet, password);
  
  console.log(`\n💰 Funding Instructions:`);
  console.log(`   1. Send ETH to: ${wallet.address} (for gas)`);
  console.log(`   2. Send USDC to: ${wallet.address} (for trading)`);
  console.log(`   3. Run "node polymarket-bot.js balance" to check\n`);
  
  return { address: wallet.address, privateKey: wallet.privateKey };
}

// Show wallet address
async function showAddress() {
  const password = process.env.WALLET_PASSWORD || 'change-this-password';
  const wallet = await loadWallet(password);
  console.log(`📍 Wallet Address: ${wallet.address}`);
  return wallet.address;
}

// Check balances
async function checkBalance() {
  const password = process.env.WALLET_PASSWORD || 'change-this-password';
  const wallet = await loadWallet(password);
  const provider = wallet.provider;
  
  console.log(`\n💰 Wallet: ${wallet.address}\n`);
  
  try {
    // ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    console.log(`   ETH: ${ethers.formatEther(ethBalance)}`);
    
    // USDC balance
    const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
    const usdc = new ethers.Contract(CONFIG.usdcAddress, usdcAbi, provider);
    const usdcBalance = await usdc.balanceOf(wallet.address);
    console.log(`   USDC: ${ethers.formatUnits(usdcBalance, 6)}`);
    
  } catch (e) {
    console.log(`   Error checking balances: ${e.message}`);
  }
}

// Place a trade on Polymarket (simplified)
async function placeTrade(marketId, outcome, amountInUSDC) {
  const password = process.env.WALLET_PASSWORD || 'change-this-password';
  const wallet = await loadWallet(password);
  const provider = wallet.provider;
  
  console.log(`\n📊 Placing Trade`);
  console.log(`   Market: ${marketId}`);
  console.log(`   Outcome: ${outcome}`);
  console.log(`   Amount: $${amountInUSDC} USDC\n`);
  
  // Check USDC balance
  const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdc = new ethers.Contract(CONFIG.usdcAddress, usdcAbi, provider);
  const balance = await usdc.balanceOf(wallet.address);
  
  if (balance < ethers.parseUnits(amountInUSDC.toString(), 6)) {
    console.log(`❌ Insufficient USDC balance`);
    console.log(`   Have: ${ethers.formatUnits(balance, 6)} USDC`);
    console.log(`   Need: ${amountInUSDC} USDC`);
    return;
  }
  
  console.log(`✅ Balance check passed`);
  console.log(`\n⚠️  Trade execution not yet implemented.`);
  console.log(`   Need to implement:`);
  console.log(`   1. Approve USDC for Conditional Tokens`);
  console.log(`   2. Place order on Polymarket exchange`);
  console.log(`   3. Wait for fill/confirmation\n`);
}

// Main
async function main() {
  const command = process.argv[2];
  
  console.log('═'.repeat(50));
  console.log('🤖 Polymarket Trading Bot - Base Network');
  console.log('═'.repeat(50) + '\n');
  
  try {
    switch (command) {
      case 'generate':
        await generateWallet();
        break;
      case 'address':
        await showAddress();
        break;
      case 'balance':
        await checkBalance();
        break;
      case 'fund':
        await showAddress();
        await checkBalance();
        break;
      case 'trade':
        const marketId = process.argv[3];
        const outcome = process.argv[4];
        const amount = process.argv[5];
        if (!marketId || !outcome || !amount) {
          console.log('Usage: node polymarket-bot.js trade <marketId> <outcome> <amountInUSDC>');
          console.log('Example: node polymarket-bot.js trade 0x123... Yes 10');
        } else {
          await placeTrade(marketId, outcome, parseFloat(amount));
        }
        break;
      default:
        console.log('Commands:');
        console.log('   generate   - Create new wallet');
        console.log('   address    - Show wallet address');
        console.log('   balance    - Check ETH/USDC balance');
        console.log('   fund       - Show address and check balance');
        console.log('   trade      - Place a trade');
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();
