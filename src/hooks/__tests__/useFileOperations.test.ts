import { renderHook, act } from '@testing-library/react'
import { useFileOperations, useLocalStorage } from '../useFileOperations'
import React from 'react'

// Wrapper component to provide proper container
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement('div', {}, children)
}

// Set up DOM environment before tests
beforeAll(() => {
    // Create a proper container element
    const container = document.createElement('div')
    container.setAttribute('id', 'root')
    document.body.appendChild(container)

    // Setup additional DOM globals
    Object.defineProperty(window, 'URL', {
        value: {
            createObjectURL: jest.fn(() => 'mock-url'),
            revokeObjectURL: jest.fn(),
        },
        writable: true,
    })

    // Initialize mock localStorage
    localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
    })
})

// Mock URL.createObjectURL and revokeObjectURL - these will be set in beforeAll
let mockCreateObjectURL: jest.Mock
let mockRevokeObjectURL: jest.Mock

// Mock document methods
const mockClick = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockLink = {
    href: '',
    download: '',
    click: mockClick
}

Object.defineProperty(document, 'createElement', {
    writable: true,
    value: jest.fn(() => mockLink)
})

Object.defineProperty(document.body, 'appendChild', {
    writable: true,
    value: mockAppendChild
})

Object.defineProperty(document.body, 'removeChild', {
    writable: true,
    value: mockRemoveChild
})

// Mock localStorage - will be available via beforeAll setup
let localStorageMock: {
    getItem: jest.Mock
    setItem: jest.Mock
    removeItem: jest.Mock
    clear: jest.Mock
}

// Mock File.text() method
global.File = jest.fn().mockImplementation(() => ({
    text: jest.fn()
})) as any

describe('useFileOperations hooks', () => {
    describe('useFileOperations', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            mockClick.mockClear()
            mockAppendChild.mockClear()
            mockRemoveChild.mockClear()
        })

        it('should initialize with default state', () => {
            const { result } = renderHook(() => useFileOperations())

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should import JSON file successfully', async () => {
            const mockData = { test: 'data', number: 123 }
            const mockFile = new File([JSON.stringify(mockData)], 'test.json', {
                type: 'application/json'
            })
            mockFile.text = jest.fn().mockResolvedValue(JSON.stringify(mockData))

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile)
            })

            expect(importedData).toEqual(mockData)
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should import CSV file successfully', async () => {
            const csvContent = 'name,age,city\nJohn,25,NYC\nJane,30,LA'
            const mockFile = new File([csvContent], 'test.csv', {
                type: 'text/csv'
            })
            mockFile.text = jest.fn().mockResolvedValue(csvContent)

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile)
            })

            expect(importedData).toEqual([
                { name: 'John', age: 25, city: 'NYC' },
                { name: 'Jane', age: 30, city: 'LA' }
            ])
            expect(result.current.error).toBe(null)
        })

        it('should handle unsupported file types', async () => {
            const mockFile = new File(['content'], 'test.txt', {
                type: 'text/plain'
            })
            mockFile.text = jest.fn().mockResolvedValue('content')

            const { result } = renderHook(() => useFileOperations())

            await expect(act(async () => {
                await result.current.importData(mockFile)
            })).rejects.toThrow('Unsupported file type. Please upload a JSON or CSV file.')

            expect(result.current.error).toBe('Unsupported file type. Please upload a JSON or CSV file.')
        })

        it('should handle JSON parsing errors', async () => {
            const invalidJson = '{ invalid json'
            const mockFile = new File([invalidJson], 'test.json', {
                type: 'application/json'
            })
            mockFile.text = jest.fn().mockResolvedValue(invalidJson)

            const { result } = renderHook(() => useFileOperations())

            await expect(act(async () => {
                await result.current.importData(mockFile)
            })).rejects.toThrow()

            expect(result.current.error).toBeTruthy()
        })

        it('should detect JSON files by extension', async () => {
            const mockData = { test: 'data' }
            const mockFile = new File([JSON.stringify(mockData)], 'test.json', {
                type: 'application/octet-stream' // Different MIME type
            })
            mockFile.text = jest.fn().mockResolvedValue(JSON.stringify(mockData))

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile)
            })

            expect(importedData).toEqual(mockData)
        })

        it('should detect CSV files by extension', async () => {
            const csvContent = 'name,value\ntest,123'
            const mockFile = new File([csvContent], 'test.csv', {
                type: 'application/octet-stream' // Different MIME type
            })
            mockFile.text = jest.fn().mockResolvedValue(csvContent)

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile)
            })

            expect(importedData).toEqual([{ name: 'test', value: 123 }])
        })

        it('should export data as JSON', () => {
            const { result } = renderHook(() => useFileOperations())
            const testData = { name: 'test', value: 123 }

            act(() => {
                result.current.exportData(testData, 'test.json', 'json')
            })

            expect(URL.createObjectURL).toHaveBeenCalled()
            expect(document.createElement).toHaveBeenCalledWith('a')
            expect(mockLink.download).toBe('test.json')
            expect(mockAppendChild).toHaveBeenCalledWith(mockLink)
            expect(mockClick).toHaveBeenCalled()
            expect(mockRemoveChild).toHaveBeenCalledWith(mockLink)
            expect(result.current.error).toBe(null)
        })

        it('should export data as CSV', () => {
            const { result } = renderHook(() => useFileOperations())
            const testData = [
                { name: 'John', age: 25 },
                { name: 'Jane', age: 30 }
            ]

            act(() => {
                result.current.exportData(testData, 'test.csv', 'csv')
            })

            expect(URL.createObjectURL).toHaveBeenCalled()
            expect(mockLink.download).toBe('test.csv')
            expect(mockClick).toHaveBeenCalled()
            expect(result.current.error).toBe(null)
        })

        it('should default to JSON export when no type specified', () => {
            const { result } = renderHook(() => useFileOperations())
            const testData = { test: 'data' }

            act(() => {
                result.current.exportData(testData, 'test')
            })

            expect(mockClick).toHaveBeenCalled()
            expect(result.current.error).toBe(null)
        })

        it('should handle export errors', () => {
            const { result } = renderHook(() => useFileOperations())
            const invalidData = undefined

                // Mock URL.createObjectURL to throw error
                ; (URL.createObjectURL as jest.Mock).mockImplementationOnce(() => {
                    throw new Error('Export failed')
                })

            act(() => {
                result.current.exportData(invalidData, 'test.json', 'json')
            })

            expect(result.current.error).toBe('Export failed')
        })

        it('should handle CSV export with empty data', () => {
            const { result } = renderHook(() => useFileOperations())

            act(() => {
                result.current.exportData([], 'test.csv', 'csv')
            })

            expect(result.current.error).toBe('Data must be a non-empty array')
        })

        it('should parse CSV with boolean and number values', async () => {
            const csvContent = 'name,active,score\nJohn,true,85\nJane,false,92'
            const mockFile = new File([csvContent], 'test.csv', { type: 'text/csv' })
            mockFile.text = jest.fn().mockResolvedValue(csvContent)

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile)
            })

            expect(importedData).toEqual([
                { name: 'John', active: true, score: 85 },
                { name: 'Jane', active: false, score: 92 }
            ])
        })

        it('should handle empty CSV files', async () => {
            const mockFile = new File([''], 'empty.csv', { type: 'text/csv' })
            mockFile.text = jest.fn().mockResolvedValue('')

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile)
            })

            expect(importedData).toEqual([])
        })

        it('should handle CSV with missing values', async () => {
            const csvContent = 'name,age,city\nJohn,,NYC\nJane,30,'
            const mockFile = new File([csvContent], 'test.csv', { type: 'text/csv' })
            mockFile.text = jest.fn().mockResolvedValue(csvContent)

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile)
            })

            expect(importedData).toEqual([
                { name: 'John', age: '', city: 'NYC' },
                { name: 'Jane', age: 30, city: '' }
            ])
        })

        it('should escape quotes in CSV export', () => {
            const { result } = renderHook(() => useFileOperations())
            const testData = [
                { name: 'John "Johnny" Doe', description: 'He said "hello"' }
            ]

            act(() => {
                result.current.exportData(testData, 'test.csv', 'csv')
            })

            expect(result.current.error).toBe(null)
        })

        it('should handle null and undefined values in CSV export', () => {
            const { result } = renderHook(() => useFileOperations())
            const testData = [
                { name: 'John', age: null, city: undefined, active: true }
            ]

            act(() => {
                result.current.exportData(testData, 'test.csv', 'csv')
            })

            expect(result.current.error).toBe(null)
        })
    })

    describe('useLocalStorage', () => {
        const testKey = 'test-key'
        const defaultValue: any = { default: true }

        beforeEach(() => {
            localStorageMock.getItem.mockClear()
            localStorageMock.setItem.mockClear()
            localStorageMock.removeItem.mockClear()
        })

        it('should initialize with default value when localStorage is empty', () => {
            localStorageMock.getItem.mockReturnValue(null)

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            expect(result.current.value).toEqual(defaultValue)
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should initialize with stored value when available', () => {
            const storedValue = { stored: true, count: 42 }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(storedValue))

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            expect(result.current.value).toEqual(storedValue)
            expect(localStorageMock.getItem).toHaveBeenCalledWith(testKey)
        })

        it('should use default value when localStorage parsing fails', () => {
            localStorageMock.getItem.mockReturnValue('invalid json')
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            expect(result.current.value).toEqual(defaultValue)
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
        })

        it('should set value and save to localStorage', () => {
            localStorageMock.getItem.mockReturnValue(null)

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))
            const newValue = { updated: true, count: 5 }

            act(() => {
                result.current.setValue(newValue)
            })

            expect(result.current.value).toEqual(newValue)
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                testKey,
                JSON.stringify(newValue)
            )
            expect(result.current.error).toBe(null)
        })

        it('should set value using function updater', () => {
            const initialValue = { count: 5 }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(initialValue))

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            act(() => {
                result.current.setValue((prev: any) => ({ ...prev, count: prev.count + 1 }))
            })

            expect(result.current.value).toEqual({ count: 6 })
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                testKey,
                JSON.stringify({ count: 6 })
            )
        })

        it('should handle localStorage setItem errors', () => {
            localStorageMock.getItem.mockReturnValue(null)
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded')
            })
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            act(() => {
                result.current.setValue({ new: 'value' })
            })

            expect(result.current.error).toBe('Storage quota exceeded')
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
        })

        it('should clear value and remove from localStorage', () => {
            const storedValue = { stored: true }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(storedValue))

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            act(() => {
                result.current.clearValue()
            })

            expect(result.current.value).toEqual(defaultValue)
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(testKey)
            expect(result.current.error).toBe(null)
        })

        it('should handle localStorage removeItem errors', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify({ test: true }))
            localStorageMock.removeItem.mockImplementation(() => {
                throw new Error('Remove failed')
            })
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            act(() => {
                result.current.clearValue()
            })

            expect(result.current.error).toBe('Remove failed')
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
        })

        it('should handle SSR environment (no window)', () => {
            const originalWindow = global.window
            delete (global as any).window

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            expect(result.current.value).toEqual(defaultValue)

            global.window = originalWindow
        })

        it('should handle setValue in SSR environment', () => {
            const originalWindow = global.window
            delete (global as any).window

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            act(() => {
                result.current.setValue({ ssr: true })
            })

            expect(result.current.value).toEqual({ ssr: true })

            global.window = originalWindow
        })

        it('should handle clearValue in SSR environment', () => {
            const originalWindow = global.window
            delete (global as any).window

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            act(() => {
                result.current.clearValue()
            })

            expect(result.current.value).toEqual(defaultValue)

            global.window = originalWindow
        })

        it('should set loading state temporarily', () => {
            localStorageMock.getItem.mockReturnValue(null)

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue))

            act(() => {
                result.current.setValue({ test: true })
            })

            expect(result.current.loading).toBe(false) // Should be false after completion
        })
    })
})
