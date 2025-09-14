# FIRE Planning Dashboard 🔥

> A comprehensive web application for tracking and planning your Financial Independence, Retire Early (FIRE) journey

[![CI/CD Pipeline](https://github.com/BaankeyBihari/fire/actions/workflows/ci.yml/badge.svg)](https://github.com/BaankeyBihari/fire/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/BaankeyBihari/fire/branch/main/graph/badge.svg)](https://codecov.io/gh/BaankeyBihari/fire)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3.2-blue?logo=mui)](https://mui.com/)
[![Jest](https://img.shields.io/badge/Jest-30.1.3-red?logo=jest)](https://jestjs.io/)
[![ESLint](https://img.shields.io/badge/ESLint-9.35.0-purple?logo=eslint)](https://eslint.org/)
[![Yarn](https://img.shields.io/badge/Yarn-Package%20Manager-blue?logo=yarn)](https://yarnpkg.com/)
[![Commitizen](https://img.shields.io/badge/Commitizen-Friendly-brightgreen?logo=git)](http://commitizen.github.io/cz-cli/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Private-red)](https://github.com/BaankeyBihari/fire)

## 📖 Overview

The FIRE Planning Dashboard is a modern, responsive web application designed to help individuals track their progress toward Financial Independence and Early Retirement. Built with Next.js and TypeScript, it provides comprehensive tools for financial planning, investment tracking, and retirement goal visualization.

### What is FIRE?

**FIRE** stands for **Financial Independence, Retire Early** - a movement focused on extreme savings and investment to allow for retirement well before the traditional retirement age of 65. The goal is to accumulate enough wealth to live off investment returns without depending on employment income.

## ✨ Features

### 📊 Financial Planning

- **Retirement Goal Calculator**: Set target retirement date and required income
- **SIP (Systematic Investment Plan) Planning**: Plan recurring investments with growth rates
- **Inflation Adjustment**: Account for inflation in long-term planning
- **Multi-Currency Support**: Plan in INR, USD, EUR, or GBP

### 💰 Investment Tracking

- **Portfolio Management**: Track multiple investments with real-time values
- **Tag-Based Organization**: Categorize investments by type, risk, or strategy
- **Performance Analytics**: Calculate returns, gains, and portfolio summaries
- **Historical Data**: Maintain complete investment history with date tracking

### 📈 Visualization & Analytics

- **Interactive Charts**: Visualize portfolio growth and performance trends
- **Portfolio Breakdown**: Analyze investments by tags and categories
- **Time-Window Analysis**: Filter data by 3m, 6m, 1yr, 2yr, 3yr, or all-time
- **Progress Tracking**: Monitor progress toward FIRE goals

### 🔧 Data Management

- **Import/Export**: Backup and restore data via JSON files
- **Persistent Storage**: Local storage for data persistence
- **Data Validation**: Comprehensive form validation and error handling
- **Type Safety**: Full TypeScript support for data integrity

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/BaankeyBihari/fire.git
   cd fire
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Start development server**

   ```bash
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Docker Setup

**Build and run with Docker:**

```bash
yarn docker:up
```

**Stop Docker services:**

```bash
yarn docker:down
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15.5.3, React 19.1.1, TypeScript 5.9.2
- **UI Framework**: Material-UI 7.3.2 with Emotion styling
- **State Management**: React useReducer with custom actions
- **Charts**: Chart.js with react-chartjs-2
- **Testing**: Jest 30.1.3 with React Testing Library
- **Linting**: ESLint 9.35.0 with TypeScript support
- **Styling**: Emotion CSS-in-JS with Material-UI theming

### Project Structure

```text
src/
├── components/          # Reusable React components
│   ├── Tabs/           # Main application tabs (Plan, Record, Status)
│   ├── ui/             # Common UI components
│   └── Reducer/        # State management logic
├── hooks/              # Custom React hooks
├── pages/              # Next.js pages
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and calculations
```

### Application Flow

1. **Plan Tab**: Set retirement goals, target amounts, and SIP parameters
2. **Record Tab**: Add and manage investments and inflation data
3. **Status Tab**: View analytics, charts, and progress toward FIRE goals

## 🧪 Development

### Code Quality

This project maintains high code quality standards with:

- **Automated Testing**: Comprehensive test suite with 55%+ coverage target
- **Type Safety**: Full TypeScript implementation
- **Code Linting**: ESLint with strict rules and auto-fixing
- **Commit Standards**: Commitizen for conventional commit messages
- **Git Hooks**: Pre-commit validation (TypeScript, ESLint, Tests)

### Available Scripts

```bash
# Development
yarn dev                 # Start development server
yarn build              # Build for production
yarn start              # Start production server

# Code Quality
yarn lint               # Run ESLint
yarn lint:fix           # Fix ESLint issues
yarn typecheck          # TypeScript type checking
yarn test               # Run tests
yarn test:watch         # Run tests in watch mode
yarn test:coverage      # Run tests with coverage

# Git & Commits
yarn commit             # Create conventional commit
yarn cz                 # Alternative commit command

# Docker
yarn dockerize          # Build Docker image
yarn docker:up          # Start Docker services
yarn docker:down        # Stop Docker services
```

### Testing

Run tests with coverage:

```bash
yarn test:coverage
```

### Code Coverage

[![codecov](https://codecov.io/gh/BaankeyBihari/fire/branch/main/graph/badge.svg)](https://codecov.io/gh/BaankeyBihari/fire)

View detailed coverage reports and interactive visualizations:

#### Coverage Sunburst

[![Codecov Sunburst](https://codecov.io/gh/BaankeyBihari/fire/branch/main/graphs/sunburst.svg)](https://codecov.io/gh/BaankeyBihari/fire)

The sunburst chart provides an interactive visualization of code coverage across your entire codebase. Each ring represents a different directory level, and the colors indicate coverage percentage:

- **Green**: Well-covered code (>80% coverage)
- **Yellow**: Moderately covered code (60-80% coverage)
- **Orange**: Poorly covered code (40-60% coverage)
- **Red**: Uncovered code (<40% coverage)

#### Coverage Tree Map

[![Codecov Tree](https://codecov.io/gh/BaankeyBihari/fire/branch/main/graphs/tree.svg)](https://codecov.io/gh/BaankeyBihari/fire)

#### Icicle Chart

[![Codecov Icicle](https://codecov.io/gh/BaankeyBihari/fire/branch/main/graphs/icicle.svg)](https://codecov.io/gh/BaankeyBihari/fire)

For detailed coverage analysis, visit the [Codecov Dashboard](https://codecov.io/gh/BaankeyBihari/fire).

### Commit Messages

This project uses [Commitizen](https://commitizen.github.io/cz-cli/) for standardized commit messages. See [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for details.

Use `yarn commit` instead of `git commit` to create properly formatted commit messages.

### Git Hooks

Automated quality checks run before each commit. See [GIT_HOOKS.md](./GIT_HOOKS.md) for details about:

- Pre-commit hooks (TypeScript, ESLint, Tests)
- Commit message validation
- How to bypass hooks in emergencies

## 📱 Usage Guide

### Setting Up Your FIRE Plan

1. **Navigate to Plan Tab**
   - Set your target retirement date
   - Define expected annual income at retirement
   - Configure starting SIP amount and growth rate
   - Set expected growth rate and inflation expectations

2. **Recording Investments**
   - Switch to Record Tab
   - Add your current investments with amounts and dates
   - Categorize investments with tags (e.g., "Equity", "Debt", "Gold")
   - Track inflation data for accurate projections

3. **Monitoring Progress**
   - Use Status Tab to view portfolio analytics
   - Analyze performance by time windows
   - Track progress toward FIRE goals
   - Export data for backup or external analysis

### Data Import/Export

- **Export**: Download your complete financial data as JSON
- **Import**: Restore previous data or migrate between devices
- **Backup**: Regular exports recommended for data safety

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and add tests
4. Commit using Commitizen (`yarn commit`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is private and proprietary.

## TODO

Add bhavcopy for equities for [nse](https://archives.nseindia.com/content/historical/EQUITIES/2022/APR/cm19APR2022bhav.csv.zip) and [bse](https://www.bseindia.com/download/BhavCopy/Equity/EQ040322_CSV.ZIP)
`https://archives.nseindia.com/content/historical/EQUITIES/{yyyy}/{MMM}/cm{dd}{MMM}{yyyy}bhav.csv.zip`
`https://archives.nseindia.com/products/content/sec_bhavdata_full_{dd}{mm}{yyyy}.csv`
`https://www.bseindia.com/download/BhavCopy/Equity/EQ{dd}{mm}22_CSV.ZIP`

### To Explore

`https://archives.nseindia.com/content/equities/bulk.csv`
`https://archives.nseindia.com/content/historical/DERIVATIVES/{yyyy}/{MMM}/fo{dd}{MMM}{yyyy}bhav.csv.zip`
`https://www.bseindia.com/markets/MarketInfo/BhavCopy.aspx`
`https://www.amfiindia.com/spages/NAVAll.txt`
`https://api.mfapi.in/mf/{schemeID}`
`https://api.mfapi.in/mf`
