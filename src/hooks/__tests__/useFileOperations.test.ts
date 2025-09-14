import { renderHook, act } from '@testing-library/react'
import { useFileOperations, useLocalStorage } from '../useFileOperations'

// Mock File constructor and methods
class MockFile implements Partial<File> {
    name: string
    type: string
    size: number
    lastModified: number = Date.now()
    webkitRelativePath: string = ''
    text: jest.MockedFunction<() => Promise<string>>

    constructor(bits: BlobPart[], filename: string, options?: FilePropertyBag) {
        this.name = filename
        this.type = options?.type || ''
        this.size = bits.reduce((total, bit) => {
            if (typeof bit === 'string') return total + bit.length
            if (bit instanceof ArrayBuffer) return total + bit.byteLength
            return total + (bit as any).size || 0
        }, 0)
        this.text = jest.fn()
    }

    arrayBuffer = jest.fn()
    bytes = jest.fn()
    slice = jest.fn()
    stream = jest.fn()
}

describe('useFileOperations hooks', () => {
    describe('useFileOperations', () => {
        it('should initialize with default state', () => {
            const { result } = renderHook(() => useFileOperations())

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should import JSON file successfully', async () => {
            const mockData = { name: 'test', value: 123 }
            const mockFile = new MockFile(['test content'], 'test.json', { type: 'application/json' })
            mockFile.text.mockResolvedValue(JSON.stringify(mockData))

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile as File)
            })

            expect(importedData).toEqual(mockData)
            expect(mockFile.text).toHaveBeenCalled()
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should handle unsupported file types', async () => {
            const mockFile = new MockFile(['content'], 'test.txt', { type: 'text/plain' })
            mockFile.text.mockResolvedValue('content')

            const { result } = renderHook(() => useFileOperations())

            await expect(act(async () => {
                await result.current.importData(mockFile as File)
            })).rejects.toThrow('Unsupported file type. Please upload a JSON or CSV file.')
        })

        it('should import CSV file successfully', async () => {
            const csvContent = 'name,age\nJohn,25\nJane,30'
            const mockFile = new MockFile([csvContent], 'test.csv', { type: 'text/csv' })
            mockFile.text.mockResolvedValue(csvContent)

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile as File)
            })

            expect(importedData).toEqual([
                { name: 'John', age: 25 },
                { name: 'Jane', age: 30 }
            ])
        })

        it('should handle JSON parsing errors', async () => {
            const invalidJson = '{ "invalid": json }'
            const mockFile = new MockFile([invalidJson], 'test.json', { type: 'application/json' })
            mockFile.text.mockResolvedValue(invalidJson)

            const { result } = renderHook(() => useFileOperations())

            await expect(act(async () => {
                await result.current.importData(mockFile as File)
            })).rejects.toThrow()
        })

        it('should detect JSON files by extension', async () => {
            const mockData = { test: 'data' }
            const mockFile = new MockFile(['{}'], 'test.json', { type: '' })
            mockFile.text.mockResolvedValue(JSON.stringify(mockData))

            const { result } = renderHook(() => useFileOperations())

            let importedData: any = null
            await act(async () => {
                importedData = await result.current.importData(mockFile as File)
            })

            expect(importedData).toEqual(mockData)
        })

        it('should export data as JSON', () => {
            const { result } = renderHook(() => useFileOperations())
            const testData = { name: 'test', value: 123 }

            // Mock URL.createObjectURL and URL.revokeObjectURL
            const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('mock-url')
            const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => { })

            // Mock document methods
            const mockElement = {
                href: '',
                download: '',
                click: jest.fn(),
                style: { display: '' }
            } as any
            const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockElement)
            const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement)
            const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockElement)

            act(() => {
                result.current.exportData(testData, 'test.json', 'json')
            })

            expect(createElementSpy).toHaveBeenCalledWith('a')
            expect(createObjectURLSpy).toHaveBeenCalled()
            expect(appendChildSpy).toHaveBeenCalled()
            expect(removeChildSpy).toHaveBeenCalled()

            // Cleanup
            createObjectURLSpy.mockRestore()
            revokeObjectURLSpy.mockRestore()
            createElementSpy.mockRestore()
            appendChildSpy.mockRestore()
            removeChildSpy.mockRestore()
        })
    })

    describe('useLocalStorage', () => {
        let container: HTMLDivElement

        beforeEach(() => {
            // Create a fresh container for each test
            container = document.createElement('div')
            document.body.appendChild(container)
        })

        afterEach(() => {
            // Clean up container after each test
            if (container && container.parentNode) {
                container.parentNode.removeChild(container)
            }
            // Clear localStorage
            localStorage.clear()
            // Clear all mocks
            jest.clearAllMocks()
        })

        const testKey = 'test-key'
        const defaultValue = { name: 'default', count: 0 }

        it('should initialize with default value when localStorage is empty', () => {
            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue), {
                container: document.body.appendChild(document.createElement('div'))
            })

            expect(result.current.value).toEqual(defaultValue)
            expect(result.current.loading).toBe(false)
        })

        it('should initialize with stored value when available', () => {
            const storedValue = { name: 'stored', count: 5 }
            const testKeyForThisTest = 'test-key-stored'

            // Create a fresh localStorage mock that actually stores values
            const mockLocalStorage = {
                getItem: jest.fn((key: string) => {
                    if (key === testKeyForThisTest) {
                        return JSON.stringify(storedValue)
                    }
                    return null
                }),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            }

            // Replace localStorage temporarily
            const originalLocalStorage = window.localStorage
            Object.defineProperty(window, 'localStorage', {
                value: mockLocalStorage,
                writable: true
            })

            const { result } = renderHook(() => useLocalStorage(testKeyForThisTest, defaultValue), {
                container: document.body.appendChild(document.createElement('div'))
            })

            expect(result.current.value).toEqual(storedValue)

            // Restore original localStorage
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true
            })
        })

        it('should set value and save to localStorage', () => {
            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue), {
                container: document.body.appendChild(document.createElement('div'))
            })
            const newValue = { name: 'updated', count: 5 }

            act(() => {
                result.current.setValue(newValue)
            })

            expect(result.current.value).toEqual(newValue)
        })

        it('should clear value and remove from localStorage', () => {
            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue), {
                container: document.body.appendChild(document.createElement('div'))
            })

            act(() => {
                result.current.setValue({ name: 'temp', count: 1 })
            })

            expect(result.current.value).toEqual({ name: 'temp', count: 1 })

            act(() => {
                result.current.clearValue()
            })

            expect(result.current.value).toEqual(defaultValue)
        })

        it('should handle localStorage parsing errors', () => {
            // Store the original localStorage
            const originalLocalStorage = window.localStorage

            // Mock localStorage to return invalid JSON
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: jest.fn().mockReturnValue('invalid-json{'),
                    setItem: jest.fn(),
                    removeItem: jest.fn(),
                    clear: jest.fn(),
                },
                writable: true
            })

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

            const { result } = renderHook(() => useLocalStorage(testKey, defaultValue), {
                container: document.body.appendChild(document.createElement('div'))
            })

            expect(result.current.value).toEqual(defaultValue)
            expect(consoleErrorSpy).toHaveBeenCalled()

            // Restore original localStorage
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true
            })

            consoleErrorSpy.mockRestore()
        })
    })
})
