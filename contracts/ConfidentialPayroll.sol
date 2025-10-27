// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/contracts/TFHE.sol";
import "@fhevm/solidity/contracts/Gateway.sol";

/**
 * @title ConfidentialPayroll
 * @notice A privacy-preserving payroll system using Zama's FHE technology
 * @dev Allows companies to pay employees with encrypted salaries
 */
contract ConfidentialPayroll is GatewayCaller {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    struct Company {
        string name;
        address owner;
        bool isRegistered;
        uint256 employeeCount;
        uint256 totalPayments;
    }
    
    struct Employee {
        address employeeAddress;
        address companyAddress;
        euint64 encryptedSalary;
        uint256 lastPaymentTime;
        uint256 totalReceived;
        bool isActive;
    }
    
    struct PaymentRecord {
        address from;
        address to;
        euint64 encryptedAmount;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(address => Company) public companies;
    mapping(address => Employee) public employees;
    mapping(address => mapping(address => bool)) public companyEmployees;
    mapping(address => PaymentRecord[]) public paymentHistory;
    
    // Arrays for iteration
    address[] public companyAddresses;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event CompanyRegistered(address indexed company, string name);
    event EmployeeAdded(address indexed company, address indexed employee);
    event EmployeeRemoved(address indexed company, address indexed employee);
    event SalarySet(address indexed employee, address indexed company);
    event PaymentMade(address indexed from, address indexed to, uint256 timestamp);
    event BalanceRequested(address indexed employee, uint256 requestId);
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    modifier onlyRegisteredCompany() {
        require(companies[msg.sender].isRegistered, "Company not registered");
        _;
    }
    
    modifier onlyCompanyOwner(address employee) {
        require(
            employees[employee].companyAddress == msg.sender,
            "Not employee's company"
        );
        _;
    }
    
    modifier onlyActiveEmployee() {
        require(employees[msg.sender].isActive, "Not an active employee");
        _;
    }
    
    // ============================================
    // COMPANY FUNCTIONS
    // ============================================
    
    /**
     * @notice Register a new company
     * @param _name Company name
     */
    function registerCompany(string calldata _name) external {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        companies[msg.sender] = Company({
            name: _name,
            owner: msg.sender,
            isRegistered: true,
            employeeCount: 0,
            totalPayments: 0
        });
        
        companyAddresses.push(msg.sender);
        
        emit CompanyRegistered(msg.sender, _name);
    }
    
    /**
     * @notice Add an employee to the company
     * @param _employee Employee address
     */
    function addEmployee(address _employee) external onlyRegisteredCompany {
        require(_employee != address(0), "Invalid employee address");
        require(!employees[_employee].isActive, "Employee already exists");
        
        employees[_employee] = Employee({
            employeeAddress: _employee,
            companyAddress: msg.sender,
            encryptedSalary: TFHE.asEuint64(0),
            lastPaymentTime: 0,
            totalReceived: 0,
            isActive: true
        });
        
        companyEmployees[msg.sender][_employee] = true;
        companies[msg.sender].employeeCount++;
        
        emit EmployeeAdded(msg.sender, _employee);
    }
    
    /**
     * @notice Remove an employee from the company
     * @param _employee Employee address
     */
    function removeEmployee(address _employee) 
        external 
        onlyRegisteredCompany 
        onlyCompanyOwner(_employee) 
    {
        require(employees[_employee].isActive, "Employee not active");
        
        employees[_employee].isActive = false;
        companyEmployees[msg.sender][_employee] = false;
        companies[msg.sender].employeeCount--;
        
        emit EmployeeRemoved(msg.sender, _employee);
    }
    
    /**
     * @notice Set encrypted salary for an employee
     * @param _employee Employee address
     * @param _encryptedSalary Encrypted salary amount
     * @param inputProof Proof for the encrypted input
     */
    function setSalary(
        address _employee,
        einput _encryptedSalary,
        bytes calldata inputProof
    ) external onlyRegisteredCompany onlyCompanyOwner(_employee) {
        require(employees[_employee].isActive, "Employee not active");
        
        // Convert encrypted input to euint64
        euint64 salary = TFHE.asEuint64(_encryptedSalary, inputProof);
        
        // Store encrypted salary
        employees[_employee].encryptedSalary = salary;
        
        // Allow employee to access their salary
        TFHE.allow(salary, _employee);
        TFHE.allow(salary, msg.sender);
        
        emit SalarySet(_employee, msg.sender);
    }
    
    /**
     * @notice Pay salary to an employee
     * @param _employee Employee address
     */
    function paySalary(address _employee) 
        external 
        payable
        onlyRegisteredCompany 
        onlyCompanyOwner(_employee) 
    {
        require(employees[_employee].isActive, "Employee not active");
        
        Employee storage emp = employees[_employee];
        
        // Update payment info
        emp.lastPaymentTime = block.timestamp;
        emp.totalReceived++;
        companies[msg.sender].totalPayments++;
        
        // Record payment
        paymentHistory[_employee].push(PaymentRecord({
            from: msg.sender,
            to: _employee,
            encryptedAmount: emp.encryptedSalary,
            timestamp: block.timestamp
        }));
        
        emit PaymentMade(msg.sender, _employee, block.timestamp);
    }
    
    // ============================================
    // EMPLOYEE FUNCTIONS
    // ============================================
    
    /**
     * @notice Request decrypted balance (uses Gateway for decryption)
     * @return requestId The ID for tracking the decryption request
     */
    function requestMyBalance() external onlyActiveEmployee returns (uint256) {
        Employee storage emp = employees[msg.sender];
        
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(emp.encryptedSalary);
        
        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackBalance.selector,
            0,
            block.timestamp + 100,
            false
        );
        
        emit BalanceRequested(msg.sender, requestId);
        return requestId;
    }
    
    /**
     * @notice Callback function for balance decryption
     * @param requestId The decryption request ID
     * @param decryptedSalary The decrypted salary value
     */
    function callbackBalance(
        uint256 requestId,
        uint64 decryptedSalary
    ) public onlyGateway returns (uint64) {
        // This callback is called by the Gateway contract
        // You can emit an event or store the result
        return decryptedSalary;
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get company information
     * @param _company Company address
     */
    function getCompanyInfo(address _company) 
        external 
        view 
        returns (
            string memory name,
            address owner,
            bool isRegistered,
            uint256 employeeCount,
            uint256 totalPayments
        ) 
    {
        Company memory company = companies[_company];
        return (
            company.name,
            company.owner,
            company.isRegistered,
            company.employeeCount,
            company.totalPayments
        );
    }
    
    /**
     * @notice Get employee information
     * @param _employee Employee address
     */
    function getEmployeeInfo(address _employee)
        external
        view
        returns (
            address employeeAddress,
            address companyAddress,
            uint256 lastPaymentTime,
            uint256 totalReceived,
            bool isActive
        )
    {
        Employee memory emp = employees[_employee];
        return (
            emp.employeeAddress,
            emp.companyAddress,
            emp.lastPaymentTime,
            emp.totalReceived,
            emp.isActive
        );
    }
    
    /**
     * @notice Check if an address is an employee of a company
     */
    function checkEmployeeStatus(address _company, address _employee) 
        external 
        view 
        returns (bool) 
    {
        return companyEmployees[_company][_employee];
    }
    
    /**
     * @notice Get payment history count for an employee
     */
    function getPaymentHistoryCount(address _employee) 
        external 
        view 
        returns (uint256) 
    {
        return paymentHistory[_employee].length;
    }
    
    /**
     * @notice Get all registered companies count
     */
    function getCompanyCount() external view returns (uint256) {
        return companyAddresses.length;
    }
    
    /**
     * @notice Get encrypted salary (only accessible by employee and company)
     */
    function getEncryptedSalary(address _employee) 
        external 
        view 
        returns (euint64) 
    {
        require(
            msg.sender == _employee || 
            msg.sender == employees[_employee].companyAddress,
            "Not authorized"
        );
        return employees[_employee].encryptedSalary;
    }
}
