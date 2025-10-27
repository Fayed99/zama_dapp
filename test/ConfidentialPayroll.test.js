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

    it("Should not allow empty company name", async function () {
      await expect(
        payroll.connect(company).registerCompany("")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should increment company count", async function () {
      await payroll.connect(company).registerCompany("Test Corp");
      const count = await payroll.getCompanyCount();
      expect(count).to.equal(1);
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

    it("Should not add duplicate employee", async function () {
      await payroll.connect(company).addEmployee(employee1.address);
      
      await expect(
        payroll.connect(company).addEmployee(employee1.address)
      ).to.be.revertedWith("Employee already exists");
    });

    it("Should not add employee with zero address", async function () {
      await expect(
        payroll.connect(company).addEmployee(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid employee address");
    });

    it("Should increment employee count", async function () {
      await payroll.connect(company).addEmployee(employee1.address);
      const companyInfo = await payroll.getCompanyInfo(company.address);
      expect(companyInfo.employeeCount).to.equal(1);
    });

    it("Should remove an employee", async function () {
      await payroll.connect(company).addEmployee(employee1.address);
      await payroll.connect(company).removeEmployee(employee1.address);
      
      const employeeInfo = await payroll.getEmployeeInfo(employee1.address);
      expect(employeeInfo.isActive).to.be.false;
    });

    it("Should decrement employee count on removal", async function () {
      await payroll.connect(company).addEmployee(employee1.address);
      await payroll.connect(company).removeEmployee(employee1.address);
      
      const companyInfo = await payroll.getCompanyInfo(company.address);
      expect(companyInfo.employeeCount).to.equal(0);
    });

    it("Should not allow non-company to add employee", async function () {
      await expect(
        payroll.connect(employee1).addEmployee(employee2.address)
      ).to.be.revertedWith("Company not registered");
    });

    it("Should not allow removing non-active employee", async function () {
      await expect(
        payroll.connect(company).removeEmployee(employee1.address)
      ).to.be.revertedWith("Employee not active");
    });
  });

  describe("Payment Functions", function () {
    beforeEach(async function () {
      await payroll.connect(company).registerCompany("Test Corp");
      await payroll.connect(company).addEmployee(employee1.address);
    });

    it("Should allow company to pay salary", async function () {
      await expect(
        payroll.connect(company).paySalary(employee1.address)
      ).to.emit(payroll, "PaymentMade");
    });

    it("Should update payment history", async function () {
      await payroll.connect(company).paySalary(employee1.address);
      const historyCount = await payroll.getPaymentHistoryCount(employee1.address);
      expect(historyCount).to.equal(1);
    });

    it("Should update employee's last payment time", async function () {
      await payroll.connect(company).paySalary(employee1.address);
      const employeeInfo = await payroll.getEmployeeInfo(employee1.address);
      expect(employeeInfo.lastPaymentTime).to.be.greaterThan(0);
    });

    it("Should increment total received count", async function () {
      await payroll.connect(company).paySalary(employee1.address);
      const employeeInfo = await payroll.getEmployeeInfo(employee1.address);
      expect(employeeInfo.totalReceived).to.equal(1);
    });

    it("Should not allow payment to non-employee", async function () {
      await expect(
        payroll.connect(company).paySalary(employee2.address)
      ).to.be.revertedWith("Not employee's company");
    });

    it("Should not allow non-company to pay", async function () {
      await expect(
        payroll.connect(employee2).paySalary(employee1.address)
      ).to.be.revertedWith("Company not registered");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await payroll.connect(company).registerCompany("Acme Inc");
      await payroll.connect(company).addEmployee(employee1.address);
    });

    it("Should return company info", async function () {
      const info = await payroll.getCompanyInfo(company.address);
      expect(info.name).to.equal("Acme Inc");
      expect(info.owner).to.equal(company.address);
      expect(info.isRegistered).to.be.true;
    });

    it("Should return employee info", async function () {
      const info = await payroll.getEmployeeInfo(employee1.address);
      expect(info.employeeAddress).to.equal(employee1.address);
      expect(info.companyAddress).to.equal(company.address);
      expect(info.isActive).to.be.true;
    });

    it("Should check employee status correctly", async function () {
      const isEmployee = await payroll.checkEmployeeStatus(
        company.address,
        employee1.address
      );
      expect(isEmployee).to.be.true;

      const isNotEmployee = await payroll.checkEmployeeStatus(
        company.address,
        employee2.address
      );
      expect(isNotEmployee).to.be.false;
    });

    it("Should return correct payment history count", async function () {
      const countBefore = await payroll.getPaymentHistoryCount(employee1.address);
      expect(countBefore).to.equal(0);

      await payroll.connect(company).paySalary(employee1.address);
      
      const countAfter = await payroll.getPaymentHistoryCount(employee1.address);
      expect(countAfter).to.equal(1);
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await payroll.connect(company).registerCompany("Test Corp");
      await payroll.connect(company).addEmployee(employee1.address);
    });

    it("Should not allow non-company to remove employee", async function () {
      await expect(
        payroll.connect(employee2).removeEmployee(employee1.address)
      ).to.be.revertedWith("Company not registered");
    });

    it("Should not allow wrong company to manage employee", async function () {
      // Register another company
      await payroll.connect(employee2).registerCompany("Other Corp");
      
      // Try to remove employee from different company
      await expect(
        payroll.connect(employee2).removeEmployee(employee1.address)
      ).to.be.revertedWith("Not employee's company");
    });
  });
});
