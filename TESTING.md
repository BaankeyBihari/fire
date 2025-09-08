# Testing Documentation

## Test Setup

This project includes comprehensive test coverage using Jest and React Testing Library.

### Dependencies Installed

- **jest**: JavaScript testing framework
- **@testing-library/react**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/user-event**: Fire events the way users do
- **@testing-library/dom**: DOM testing utilities
- **jest-environment-jsdom**: JSDOM environment for Jest
- **@types/jest**: TypeScript types for Jest
- **ts-jest**: TypeScript preprocessor for Jest

### Configuration Files

- **jest.config.js**: Main Jest configuration using Next.js preset
- **jest.setup.js**: Test setup file for global configurations
- **tsconfig.json**: TypeScript configuration (existing)

### Test Structure

```
src/
├── components/
│   ├── Reducer/
│   │   ├── __tests__/
│   │   │   ├── reducer.test.ts        # Core reducer logic tests
│   │   │   ├── integration.test.ts    # Integration tests
│   │   │   ├── utilities.test.ts      # Utility classes tests
│   │   │   └── actions.test.ts        # Action constants tests
│   │   ├── reducer.ts
│   │   ├── initialState.ts
│   │   └── actions.ts
│   └── Tabs/
│       ├── __tests__/
│       │   └── index.test.tsx         # Component rendering tests
│       └── index.tsx
```

### Test Categories

#### 1. Utility Function Tests (`reducer.test.ts`)

- **compareInvestment**: Tests sorting logic for investments
- **DummyInvestment/DummyInflation**: Tests for utility classes
- **Reducer function**: Tests all action types (RESET, LOAD, UPDATE\_\*)

#### 2. Integration Tests (`integration.test.ts`)

- **Plan Generation**: Tests realistic retirement planning scenarios
- **Investment Sorting**: Tests complex sorting with mixed data
- **State Management**: Tests edge cases and state consistency
- **Data Validation**: Tests date handling and empty arrays

#### 3. Utility Classes Tests (`utilities.test.ts`)

- Tests for DummyInvestment and DummyInflation class instantiation
- Property modification tests

#### 4. Action Constants Tests (`actions.test.ts`)

- Validates action name constants
- Ensures all required actions exist
- Checks for unique action names

#### 5. Component Tests (`index.test.tsx`)

- Basic rendering tests for ColorTabs component
- Navigation element presence tests
- Mock-based component interaction tests

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Test Features

1. **Comprehensive Coverage**: Tests cover business logic, utility functions, state management, and component rendering
2. **Realistic Scenarios**: Integration tests use realistic financial planning scenarios
3. **Edge Cases**: Tests handle edge cases like empty arrays, extreme values, and date consistency
4. **Mocking**: Component tests use appropriate mocking for external dependencies
5. **TypeScript Support**: Full TypeScript support with proper typing

### Key Test Scenarios

#### Financial Planning Tests

- Retirement plan generation with various SIP amounts and growth rates
- Investment sorting with mixed actual and planned entries
- Date consistency across operations
- Edge cases with high income requirements

#### State Management Tests

- Action-based state updates
- State reset functionality
- Data persistence and loading
- Multiple consecutive updates

#### Component Tests

- Component rendering without crashes
- Navigation element presence
- Tab switching functionality (mocked)
- Import/Export button presence

### Coverage Areas

The test suite covers:

- ✅ Reducer functions and business logic
- ✅ Utility functions and classes
- ✅ Action constants
- ✅ State management
- ✅ Component rendering
- ✅ Integration scenarios
- ✅ Edge cases and error handling

### Future Test Enhancements

To further improve the test suite, consider adding:

- End-to-end tests with Cypress or Playwright
- More detailed component interaction tests
- Performance tests for large datasets
- Visual regression tests
- API integration tests (if applicable)
- Accessibility tests
