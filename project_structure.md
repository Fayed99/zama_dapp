# 🚀 Complete Setup Guide - Confidential Payroll

## Step-by-Step Instructions to Get Your Project Running

### 📁 Step 1: Create Project Structure

Open your terminal and run these commands:

```bash
# Create main project folder
mkdir confidential-payroll
cd confidential-payroll

# Create folder structure
mkdir -p contracts
mkdir -p scripts
mkdir -p test
mkdir -p frontend/src/components
mkdir -p frontend/public
```

Your folder structure should look like this:
```
confidential-payroll/
├── contracts/
│   └── ConfidentialPayroll.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── ConfidentialPayroll.test.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PayrollDashboard.jsx
│   │   └── App.jsx
│   └── package.json
├── hardhat.config.js
├── package.json
├── .env
└── README.md
```

---

### 📄 Step 2: Copy Files from Artifacts

**Go back to the chat and click the copy button (📋) on each artifact:**

1. **Copy `ConfidentialPayroll.sol`**
   - Save to: `contracts/ConfidentialPayroll.sol`

2. **Copy `Payroll Dashboard UI`**
   - Save to: `frontend/src/components/PayrollDashboard.jsx`

3. **Copy `Confidential Payroll - Setup Guide`**
   - Save to: `README.md`

---

### 💻 Step 3: Initialize the Smart Contract Project

```bash
# Initialize npm project
npm init -y

# Install Hardhat
npm install --save-dev hardhat

# Initialize Hardhat project
npx hardhat init
# Choose: "Create a JavaScript project"

# Install FHEVM dependencies
npm install --save-dev @fhevm/solidity
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @nomicfoundation/hardhat-ethers ethers
npm install dotenv
```

---

### 📝 Step 4: Create Configuration Files

#### `hardhat.config.js`
Create this file in the root directory:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    zamaTestnet: {
      url: "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
```

#### `.env`
Create this file in the root directory:

```bash
# Add your private key (NEVER commit this file!)
PRIVATE_KEY=your_wallet_private_key_here

# Optional: Add your Infura/Alchemy API key
INFURA_API_KEY=your_infura_key_here
```

#### `.gitignore`
Create this file to avoid committing sensitive data:

```
node_modules/
.env
cache/
artifacts/
coverage/
.coverage_cache/
.coverage_contracts/
typechain-types/
```

---

### 🔨 Step 5: Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ConfidentialPayroll contract...");

  // Get the contract factory
  const ConfidentialPayroll = await hre.ethers.getContractFactory("ConfidentialPayroll");
  
  // Deploy the contract
  const payroll = await ConfidentialPayroll.deploy();
  
  // Wait for deployment
  await payroll.waitForDeployment();
  
  // Get the deployed address
  const address = await payroll.getAddress();
  
  console.log("✅ ConfidentialPayroll deployed to:", address);
  console.log("\n📋 Save this address for frontend integration!");
  
  // Save deployment info to a file
  const fs = require('fs');
  const deploymentInfo = {
    address: address,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📁 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

### 🧪 Step 6: Create Test File

Create `test/ConfidentialPayroll.test.js`:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConfidentialPayroll", function () {
  let payroll;
  let company;
  let employee1;
  let employee2;

  beforeEach(async function () {
    [company, employee1, employee2] = await ethers.getSigners();
    
    const ConfidentialPayroll = await ethers.getContractFactory("ConfidentialPayroll");
    payroll = await ConfidentialPayroll.deploy();
    await payroll.waitForDeployment();
  });

  describe("Company Registration", function () {
    it("Should register a company", async function () {
      await payroll.connect(company).registerCompany("Test Corp");
      
      const companyInfo = await payroll.getCompanyInfo(company.address);
      expect(companyInfo.isRegistered).to.be.true;
      expect(companyInfo.name).to.equal("Test Corp");
    });

    it("Should not allow duplicate registration", async function () {
      await payroll.connect(company).registerCompany("Test Corp");
      
      await expect(
        payroll.connect(company).registerCompany("Test Corp 2")
      ).to.be.revertedWith("Company already registered");
    });
  });

  describe("Employee Management", function () {
    beforeEach(async function () {
      await payroll.connect(company).registerCompany("Test Corp");
    });

    it("Should add an employee", async function () {
      await payroll.connect(company).addEmployee(employee1.address);
      
      const isEmployee = await payroll.checkEmployeeStatus(
        company.address,
        employee1.address
      );
      expect(isEmployee).to.be.true;
    });

    it("Should remove an employee", async function () {
      await payroll.connect(company).addEmployee(employee1.address);
      await payroll.connect(company).removeEmployee(employee1.address);
      
      const employeeInfo = await payroll.getEmployeeInfo(employee1.address);
      expect(employeeInfo.isActive).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("Should return company info", async function () {
      await payroll.connect(company).registerCompany("Acme Inc");
      
      const info = await payroll.getCompanyInfo(company.address);
      expect(info.name).to.equal("Acme Inc");
      expect(info.employeeCount).to.equal(0);
    });
  });
});
```

---

### ⚡ Step 7: Setup Frontend

```bash
# Navigate to frontend folder
cd frontend

# Create React app with Vite (faster than create-react-app)
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages
npm install lucide-react
npm install ethers@6
npm install @fhevm/fhevmjs

# Go back to root
cd ..
```

#### Update `frontend/src/App.jsx`:

```javascript
import PayrollDashboard from './components/PayrollDashboard'
import './App.css'

function App() {
  return (
    <div className="App">
      <PayrollDashboard />
    </div>
  )
}

export default App
```

---

### 🎯 Step 8: Commands to Run

#### Compile Contract
```bash
npx hardhat compile
```

#### Run Tests
```bash
npx hardhat test
```

#### Deploy to Local Network
```bash
# Terminal 1 - Start local node
npx hardhat node

# Terminal 2 - Deploy
npx hardhat run scripts/deploy.js --network localhost
```

#### Deploy to Zama Testnet
```bash
# Make sure you have testnet ETH in your wallet first
npx hardhat run scripts/deploy.js --network zamaTestnet
```

#### Run Frontend
```bash
cd frontend
npm run dev
```

---

### 🔑 Step 9: Get Testnet Funds

Before deploying to Zama testnet, you need testnet ETH:

1. **Get your wallet address**
   ```bash
   npx hardhat console --network zamaTestnet
   ```
   Then run:
   ```javascript
   (await ethers.getSigners())[0].address
   ```

2. **Request testnet funds**
   - Visit Zama Discord or testnet faucet
   - Or use Sepolia faucet (if Zama uses Sepolia)

---

### 📋 Step 10: Quick Reference Commands

```bash
# Compile
npm run compile
# or
npx hardhat compile

# Test
npm run test
# or
npx hardhat test

# Deploy local
npx hardhat run scripts/deploy.js --network localhost

# Deploy testnet
npx hardhat run scripts/deploy.js --network zamaTestnet

# Run frontend
cd frontend && npm run dev

# Clean build
npx hardhat clean
```

---

### 🔗 Step 11: Connect Frontend to Contract

After deployment, update your frontend with the contract address:

Create `frontend/src/config.js`:

```javascript
export const CONTRACT_ADDRESS = "0x..."; // Paste deployed address here
export const NETWORK_ID = 8009; // Zama testnet

export const CONTRACT_ABI = [
  // Paste ABI from artifacts/contracts/ConfidentialPayroll.sol/ConfidentialPayroll.json
  "function registerCompany(string calldata _name) external",
  "function addEmployee(address _employee) external",
  "function paySalary(address _employee, externalEuint64 encryptedAmount, bytes calldata inputProof) external",
  // ... add other function signatures
];
```

---

### ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] Project folder created
- [ ] All files copied from artifacts
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with private key
- [ ] Contract compiles (`npx hardhat compile`)
- [ ] Tests pass (`npx hardhat test`)
- [ ] Contract deployed to testnet
- [ ] Frontend runs (`cd frontend && npm run dev`)
- [ ] Contract address updated in frontend config

---

### 🆘 Common Issues & Solutions

#### Issue: "Cannot find module @fhevm/solidity"
```bash
npm install --save-dev @fhevm/solidity
```

#### Issue: "Private key not provided"
- Make sure `.env` file exists
- Check `PRIVATE_KEY` format (no 0x prefix needed)

#### Issue: "Insufficient funds"
- Get testnet ETH from faucet
- Check wallet balance

#### Issue: Frontend won't start
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

#### Issue: Contract won't compile
- Check Solidity version in `hardhat.config.js`
- Run `npx hardhat clean` then compile again

---

### 📚 Next Steps

1. **Test locally first** - Use Hardhat network
2. **Deploy to testnet** - Test with real FHE encryption
3. **Build full frontend** - Connect wallet, encrypt/decrypt
4. **Add features** - Recurring payments, notifications, etc.
5. **Audit code** - Before any mainnet deployment

---

### 🎓 Learning Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Zama Protocol Docs](https://docs.zama.ai/protocol)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)

---

### 💬 Need Help?

- Zama Discord: Community support
- GitHub Issues: Report bugs
- Stack Overflow: Technical questions

---

**🎉 You're all set! Start with compiling the contract and running tests, then gradually move to deployment and frontend integration.**