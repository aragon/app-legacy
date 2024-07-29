# Getting Started with E2E Testing Using Playwright and Synpress

This guide provides a quick start for running end-to-end (E2E) tests using Playwright and Synpress.

## Prerequisites

1. **Node.js**: [Download Node.js](https://nodejs.org/).
2. **Yarn or npm**: Choose your preferred package manager.

## Project Setup

1. **Clone the Repository**:
   git clone <repository-url>
   cd <project-directory>

2. **Install Dependencies**:
   yarn install

   # or

   npm install

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory using `.env.example` as a template if available. Include the following variables with your values:
   METAMASK_SEED_PHRASE=<value>
   METAMASK_PASSWORD=<value>

4. **Install Playwright with dependencies**:
   yarn playwright install --with-deps

5. **Build Synpress cache** (needed for Metamask, see `e2e/basic.setup.ts` for details):
   npx synpress ./e2e/

## Running E2E Tests

- **Ensure Metamask Wallet has Sufficient Funds**: Before running tests, make sure your Metamask wallet is funded.

- **Running All or Specific Tests**:
  - From Playwright UI:
    yarn e2e
  - On a specific platform (e.g., Firefox):
    yarn playwright test --project firefox
  - See `playwright.config.js` for more options.

## Troubleshooting

- **Common Issues**: Review error messages for details.
- **Debugging**: Utilize Playwright's debugging tools.

For further assistance, consult the official documentation of [Playwright](https://playwright.dev/docs/intro) and [Synpress](https://synpress.io/).
