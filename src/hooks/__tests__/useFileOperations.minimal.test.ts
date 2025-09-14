import { renderHook } from '@testing-library/react'
import { useFileOperations } from '../useFileOperations'

describe('minimal useFileOperations test', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useFileOperations())

        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
    })
})
