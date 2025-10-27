# Confidential Payroll - Quick Start Guide for Codespaces

## 🚀 Run This in Codespace Terminal

### Option 1: Automated Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env and add your private key

# 3. Compile contracts
npm run compile

# 4. Run tests
npm run test

# 5. Setup frontend
cd frontend
npm install

# 6. Start development server
npm run dev
```

## 🌐 Chain Configuration

Your app is configured for **Zama Testnet**:
- Chain ID: 8009
- RPC URL: https://devnet.zama.ai
- Explorer: https://explorer-testnet.zama.ai

## 🔑 Get Testnet Tokens

1. Visit Zama Discord: https://discord.gg/zama
2. Go to #faucet channel
3. Request testnet tokens with your wallet address

## 📝 Deploy Contract

```bash
# Deploy to Zama Testnet
npm run deploy:testnet
```

After deployment:
1. Copy contract address from `deployment.json`
2. Update `frontend/src/config.js` with the address
3. Start frontend: `cd frontend && npm run dev`

## 🎯 Access Your App

Codespaces will automatically forward port 3000. Look for:
- "Ports" tab in VS Code
- Or popup notification with URL

## 💡 Tips

- Codespace auto-saves your work
- Port 3000 is auto-forwarded for frontend
- You can keep it running 24/7 (within usage limits)
- MetaMask works in Codespace browser tabs

## 📊 What You'll Build With

- **Smart Contracts**: Zama Testnet (now) → Ethereum Mainnet (Q4 2025)
- **Frontend**: React + Vite running in Codespace
- **Testing**: Hardhat local network in Codespace

---

**Ready to start? Create your Codespace at: https://github.com/Fayed99/zama_dapp**
