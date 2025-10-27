import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Building2, Users, Wallet, Send, Shield, Eye, EyeOff } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_CONFIG } from '../config';

const PayrollDashboard = () => {
  // State management
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [userType, setUserType] = useState(''); // 'company' or 'employee'
  const [loading, setLoading] = useState(false);
  
  // Company state
  const [companyName, setCompanyName] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [employeeAddress, setEmployeeAddress] = useState('');
  
  // Employee state
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [salaryAmount, setSalaryAmount] = useState('');

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setProvider(provider);
      setAccount(accounts[0]);
      setContract(contract);
      
      // Check if user is company or employee
      await checkUserType(accounts[0], contract);
      
      setLoading(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
      setLoading(false);
    }
  };

  // Check user type
  const checkUserType = async (address, contractInstance) => {
    try {
      const companyInfo = await contractInstance.getCompanyInfo(address);
      if (companyInfo[2]) { // isRegistered
        setUserType('company');
        setCompanyInfo({
          name: companyInfo[0],
          owner: companyInfo[1],
          isRegistered: companyInfo[2],
          employeeCount: companyInfo[3].toString(),
          totalPayments: companyInfo[4].toString()
        });
      } else {
        const employeeInfo = await contractInstance.getEmployeeInfo(address);
        if (employeeInfo[4]) { // isActive
          setUserType('employee');
          setEmployeeInfo({
            employeeAddress: employeeInfo[0],
            companyAddress: employeeInfo[1],
            lastPaymentTime: employeeInfo[2].toString(),
            totalReceived: employeeInfo[3].toString(),
            isActive: employeeInfo[4]
          });
        }
      }
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };

  // Register company
  const registerCompany = async () => {
    if (!companyName) {
      alert('Please enter company name');
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.registerCompany(companyName);
      await tx.wait();
      alert('Company registered successfully!');
      await checkUserType(account, contract);
      setCompanyName('');
      setLoading(false);
    } catch (error) {
      console.error('Error registering company:', error);
      alert('Failed to register company');
      setLoading(false);
    }
  };

  // Add employee
  const addEmployee = async () => {
    if (!employeeAddress || !ethers.isAddress(employeeAddress)) {
      alert('Please enter valid employee address');
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.addEmployee(employeeAddress);
      await tx.wait();
      alert('Employee added successfully!');
      await checkUserType(account, contract);
      setEmployeeAddress('');
      setLoading(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
      setLoading(false);
    }
  };

  // Pay salary
  const paySalary = async () => {
    if (!employeeAddress || !ethers.isAddress(employeeAddress)) {
      alert('Please enter valid employee address');
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.paySalary(employeeAddress);
      await tx.wait();
      alert('Salary paid successfully!');
      await checkUserType(account, contract);
      setEmployeeAddress('');
      setLoading(false);
    } catch (error) {
      console.error('Error paying salary:', error);
      alert('Failed to pay salary');
      setLoading(false);
    }
  };

  // Request balance (for employees)
  const requestBalance = async () => {
    try {
      setLoading(true);
      const tx = await contract.requestMyBalance();
      await tx.wait();
      alert('Balance request submitted! Check back later for decrypted value.');
      setLoading(false);
    } catch (error) {
      console.error('Error requesting balance:', error);
      alert('Failed to request balance');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Confidential Payroll</h1>
                <p className="text-gray-600">Privacy-preserving salary system powered by Zama FHE</p>
              </div>
            </div>
            {!account ? (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Wallet className="w-5 h-5" />
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="text-right">
                <p className="text-sm text-gray-600">Connected as</p>
                <p className="font-mono text-sm font-semibold text-indigo-600">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>
                <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                  {userType ? userType.toUpperCase() : 'NEW USER'}
                </span>
              </div>
            )}
          </div>
        </div>

        {account && !userType && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Register as Company
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={registerCompany}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Company'}
              </button>
            </div>
          </div>
        )}

        {/* Company Dashboard */}
        {userType === 'company' && companyInfo && (
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                Company Dashboard
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="text-xl font-bold text-indigo-600">{companyInfo.name}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-xl font-bold text-green-600">{companyInfo.employeeCount}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-xl font-bold text-blue-600">{companyInfo.totalPayments}</p>
                </div>
              </div>
            </div>

            {/* Add Employee */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Add Employee
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Employee wallet address (0x...)"
                  value={employeeAddress}
                  onChange={(e) => setEmployeeAddress(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={addEmployee}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </div>

            {/* Pay Salary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Pay Salary
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Employee wallet address (0x...)"
                  value={employeeAddress}
                  onChange={(e) => setEmployeeAddress(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={paySalary}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Pay Salary'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                💡 Tip: Make sure to set encrypted salary first using the setSalary function
              </p>
            </div>
          </div>
        )}

        {/* Employee Dashboard */}
        {userType === 'employee' && employeeInfo && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Employee Dashboard
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="text-sm font-mono text-indigo-600 break-all">
                    {employeeInfo.companyAddress}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Payments Received</p>
                  <p className="text-xl font-bold text-green-600">{employeeInfo.totalReceived}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={requestBalance}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  {loading ? 'Requesting...' : 'Request Decrypted Salary'}
                </button>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  🔒 Your salary is encrypted. Click to request decryption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {account && (
          <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🔐 Privacy First</h3>
            <p className="text-indigo-100">
              All salary information is encrypted using Zama's Fully Homomorphic Encryption (FHE). 
              Only authorized parties can decrypt and view sensitive data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollDashboard;
