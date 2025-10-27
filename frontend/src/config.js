// Contract configuration
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Update after deployment
export const NETWORK_ID = 8009; // Zama testnet

// Simplified ABI - add full ABI from artifacts after compilation
export const CONTRACT_ABI = [
  "function registerCompany(string calldata _name) external",
  "function addEmployee(address _employee) external",
  "function removeEmployee(address _employee) external",
  "function setSalary(address _employee, einput _encryptedSalary, bytes calldata inputProof) external",
  "function paySalary(address _employee) external payable",
  "function requestMyBalance() external returns (uint256)",
  "function getCompanyInfo(address _company) external view returns (string memory, address, bool, uint256, uint256)",
  "function getEmployeeInfo(address _employee) external view returns (address, address, uint256, uint256, bool)",
  "function checkEmployeeStatus(address _company, address _employee) external view returns (bool)",
  "function getPaymentHistoryCount(address _employee) external view returns (uint256)",
  "function getCompanyCount() external view returns (uint256)",
  "event CompanyRegistered(address indexed company, string name)",
  "event EmployeeAdded(address indexed company, address indexed employee)",
  "event EmployeeRemoved(address indexed company, address indexed employee)",
  "event SalarySet(address indexed employee, address indexed company)",
  "event PaymentMade(address indexed from, address indexed to, uint256 timestamp)"
];

export const NETWORK_CONFIG = {
  8009: {
    name: "Zama Testnet",
    rpcUrl: "https://devnet.zama.ai",
    chainId: "0x1F49", // 8009 in hex
    symbol: "ZAMA",
    explorer: "https://explorer.zama.ai"
  }
};
