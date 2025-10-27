# 🔐 Confidential Payroll System

A privacy-preserving payroll management system built with **Zama Protocol's Fully Homomorphic Encryption (FHE)** technology. This dApp allows companies to manage employee salaries with complete confidentiality on the blockchain.

## 🌟 Features

- **🏢 Company Registration**: Companies can register and manage their payroll system
- **👥 Employee Management**: Add, remove, and manage employees
- **💰 Encrypted Salaries**: All salary information is encrypted using FHE
- **🔒 Privacy-First**: Only authorized parties can decrypt sensitive data
- **📊 Payment Tracking**: Track payment history while maintaining privacy
- **⚡ Real-time Dashboard**: Modern React UI for easy management

## 🏗️ Technology Stack

### Smart Contracts
- **Solidity 0.8.24**: Smart contract language
- **Zama FHE (@fhevm/solidity)**: Fully Homomorphic Encryption library
- **Hardhat**: Development environment
- **Ethers.js v6**: Blockchain interaction

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **fhevmjs**: FHE encryption on client-side

## 📁 Project Structure

```
confidential-payroll/
├── contracts/
│   └── ConfidentialPayroll.sol    # Main smart contract
├── scripts/
│   └── deploy.js                   # Deployment script
├── test/
│   └── ConfidentialPayroll.test.js # Contract tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PayrollDashboard.jsx # Main UI component
│   │   ├── App.jsx                  # App entry
│   │   ├── main.jsx                 # React entry
│   │   └── config.js                # Contract configuration
│   ├── package.json
│   └── vite.config.js
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Root dependencies
├── .env.example                    # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask wallet
- Zama testnet ETH (from faucet)

### Installation

#### 1. Install Root Dependencies

```bash
# Install Hardhat and dependencies
npm install
```

#### 2. Setup Environment Variables

```bash
# Copy the example env file
copy .env.example .env

# Edit .env and add your private key
# PRIVATE_KEY=your_wallet_private_key_here
```

⚠️ **Never commit your `.env` file!**

#### 3. Compile Smart Contracts

```bash
npm run compile
```

#### 4. Run Tests

```bash
npm run test
```

#### 5. Deploy Contract

**Local Deployment (for testing):**

```bash
# Terminal 1 - Start local Hardhat node
npm run node

# Terminal 2 - Deploy to local network
npm run deploy:local
```

**Testnet Deployment:**

```bash
npm run deploy:testnet
```

After deployment, copy the contract address from `deployment.json`.

#### 6. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Update contract address in src/config.js
# CONTRACT_ADDRESS = "0x..." (paste your deployed address)
```

#### 7. Run Frontend

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📖 Usage Guide

### For Companies

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Register Company**: Enter company name and register
3. **Add Employees**: Enter employee wallet addresses
4. **Set Salaries**: Use `setSalary()` with encrypted amounts
5. **Pay Salaries**: Click "Pay Salary" to process payments

### For Employees

1. **Connect Wallet**: Click "Connect Wallet" button
2. **View Dashboard**: See payment history and company info
3. **Request Balance**: Click to decrypt your salary (privacy-preserving)

## 🔧 Available Scripts

### Root Directory

```bash
npm run compile        # Compile smart contracts
npm run test          # Run contract tests
npm run deploy:local  # Deploy to local network
npm run deploy:testnet # Deploy to Zama testnet
npm run node          # Start local Hardhat node
npm run clean         # Clean build artifacts
```

### Frontend Directory

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

## 🧪 Smart Contract Functions

### Company Functions

```solidity
registerCompany(string _name)           // Register a new company
addEmployee(address _employee)          // Add employee
removeEmployee(address _employee)       // Remove employee
setSalary(address, einput, bytes)       // Set encrypted salary
paySalary(address _employee)            // Pay salary
```

### Employee Functions

```solidity
requestMyBalance()                      // Request decrypted salary
getEmployeeInfo(address)                // Get employee details
```

### View Functions

```solidity
getCompanyInfo(address)                 // Get company details
checkEmployeeStatus(address, address)   // Check if employee exists
getPaymentHistoryCount(address)         // Get payment count
```

## 🔐 Security Features

1. **Fully Homomorphic Encryption**: Salaries are encrypted end-to-end
2. **Access Control**: Only authorized parties can access sensitive data
3. **On-chain Privacy**: Computations on encrypted data without decryption
4. **Gateway Pattern**: Secure decryption through Zama Gateway

## 🌐 Network Configuration

### Zama fhEVM Devnet
- **Chain ID**: 8009
- **RPC URL**: https://rpc.fhevm.dev.zama.ai
- **Explorer**: https://explorer.fhevm.dev.zama.ai

### Adding to MetaMask

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter Zama devnet details:
   - Network Name: Zama fhEVM Devnet
   - RPC URL: https://rpc.fhevm.dev.zama.ai
   - Chain ID: 8009
   - Currency Symbol: ZAMA

## 🐛 Troubleshooting

### "Cannot find module @fhevm/solidity"
```bash
npm install --save-dev @fhevm/solidity
```

### "Private key not provided"
- Ensure `.env` file exists in root
- Check `PRIVATE_KEY` is set correctly
- No `0x` prefix needed

### "Insufficient funds"
- Get testnet ETH from Zama faucet
- Check wallet balance

### Frontend won't connect
- Update `CONTRACT_ADDRESS` in `frontend/src/config.js`
- Ensure MetaMask is on correct network
- Check contract is deployed

### Compilation errors
```bash
npm run clean
npm run compile
```

## 📚 Learn More

- [Zama Protocol Documentation](https://docs.zama.ai/)
- [fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This is a demonstration project. Audit the code thoroughly before using in production. Not financial advice.

## 📞 Support

- GitHub Issues: Report bugs and request features
- Zama Discord: Community support
- Documentation: Check the docs first

## 🎯 Roadmap

- [ ] Recurring automated payments
- [ ] Multi-currency support
- [ ] Employee benefits management
- [ ] Tax calculation features
- [ ] Mobile app
- [ ] Admin dashboard analytics

## 💡 Tips

1. **Test Locally First**: Always test on Hardhat network before deploying
2. **Keep Keys Safe**: Never share or commit private keys
3. **Gas Optimization**: FHE operations are gas-intensive, plan accordingly
4. **Audit Code**: Have contracts audited before mainnet deployment
5. **User Education**: Educate users about FHE and privacy features

---

**Built with ❤️ using Zama Protocol's FHE technology**

🔗 [GitHub Repository](#) | 🌐 [Live Demo](#) | 📖 [Documentation](#)