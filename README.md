# Playwright POM Automation Framework

A JavaScript-based web automation testing framework using **Playwright** and **Page Object Model (POM)**.

## Key Features

- Page Object Model architecture
- Excel-based test data management
- Automated UI testing
- Step-by-step screenshot evidence
- Individual PDF reports using Python ReportLab
- Playwright HTML reports
- CI/CD automation with GitHub Actions
- Pull Request and branch protection

## Tech Stack

JavaScript | Playwright | Node.js | Excel | Python | ReportLab | GitHub Actions

## Test Coverage

| Test Scenario | Test Cases |
|---|---:|
| Cart | 3 |
| Contact Us | 1 |
| Login | 1 |
| Logout | 1 |
| Products | 2 |
| Registration | 2 |
| **Total** | **10** |

## Installation

```bash
git clone https://github.com/IrvandiHutapea/Playwright-POM-Project.git
cd Playwright-POM-Project
npm install
npx playwright install chromium
pip install -r requirements.txt
```

## Running Tests

Run all tests:

```bash
npm test
```

Run headed mode:

```bash
npm run test:headed
```

Run debug mode:

```bash
npm run test:debug
```

Run specific tests:

```bash
npm run test:login
npm run test:product
npm run test:register
npm run test:contact
npm run test:logout
```

## Test Reports

**HTML Report**

```bash
npm run report
```

**Individual PDF Reports**

PDF reports are automatically generated after test execution using Python ReportLab.

Manual generation:

```bash
py reports/generate_pdf_report.py
```

Output directory:

```text
Reports/Individual/
```

## CI/CD Pipeline

GitHub Actions automatically runs tests on every push and Pull Request.

Pipeline outputs:
- Playwright test results
- Individual PDF reports
- HTML reports
- Test evidence artifacts

The main branch is protected using GitHub Rulesets.

## Project Structure

```text
Playwright-POM-Project/
├── .github/workflows/
├── locators/
├── pages/
├── reports/
├── test_data/
├── tests/
├── utils/
├── Reports/
├── playwright.config.js
├── package.json
├── package-lock.json
├── requirements.txt
└── README.md
```

## Application Under Test

[Automation Exercise](https://automationexercise.com/)

## Author

**Irvandi Pransena Hutapea**

Automation Engineer | Software Quality Assurance

[GitHub Repository](https://github.com/IrvandiHutapea/Playwright-POM-Project)