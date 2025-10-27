#!/bin/bash

# 🚀 Confidential Payroll Setup Script
# Run this in GitHub Codespaces

echo "🔐 Setting up Confidential Payroll dApp..."

# Install root dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create .env file
echo "⚙️ Creating environment file..."
cp .env.example .env
echo "✅ Created .env - Remember to add your private key!"

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile

# Run tests
echo "🧪 Running tests..."
npm run test

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Add your private key to .env file"
echo "2. Get testnet tokens from Zama faucet"
echo "3. Deploy: npm run deploy:testnet"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Chain: Zama fhEVM Devnet (Chain ID: 8009)"
echo "🔗 RPC: https://rpc.fhevm.dev.zama.ai"
