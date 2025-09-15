// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { URL } from 'url'

// React 19 compatibility: act is now imported from react-dom/test-utils
import { act } from 'react'
global.act = act

// Mock URL for NextAuth compatibility in test environment
global.URL = global.URL || URL

// Set up DOM environment for tests
Object.defineProperty(window, 'URL', {
    value: global.URL,
    writable: true,
})

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
})

// Mock file operations for tests
Object.defineProperty(window, 'URL', {
    value: {
        createObjectURL: jest.fn(() => 'mock-url'),
        revokeObjectURL: jest.fn(),
    },
    writable: true,
})

// Override the URL constructor for NextAuth
Object.defineProperty(window, 'URL', {
    value: global.URL,
    writable: true,
})

// Mock fetch for tests that need it
global.fetch = jest.fn()

// Set up a container element for tests
beforeEach(() => {
    // Clear any existing body content
    document.body.innerHTML = ''
    // Clear localStorage mock
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
})
