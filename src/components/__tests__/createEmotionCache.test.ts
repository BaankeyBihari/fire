import createEmotionCache from '../createEmotionCache'

describe('createEmotionCache', () => {
    test('creates emotion cache successfully', () => {
        const cache = createEmotionCache()
        expect(cache).toBeTruthy()
        expect(cache.key).toBeTruthy()
    })

    test('cache has correct key', () => {
        const cache = createEmotionCache()
        expect(typeof cache.key).toBe('string')
        expect(cache.key.length).toBeGreaterThan(0)
    })

    test('cache has sheet property', () => {
        const cache = createEmotionCache()
        expect(cache.sheet).toBeTruthy()
    })

    test('cache can be created multiple times', () => {
        const cache1 = createEmotionCache()
        const cache2 = createEmotionCache()

        expect(cache1).toBeTruthy()
        expect(cache2).toBeTruthy()
        expect(cache1.key).toBe(cache2.key)
    })

    test('cache has sheet property', () => {
        const cache = createEmotionCache()
        expect(cache.sheet).toBeTruthy()
    })

    test('cache configuration is valid', () => {
        const cache = createEmotionCache()
        expect(typeof cache.key).toBe('string')
        expect(cache.key.length).toBeGreaterThan(0)
    })
})
