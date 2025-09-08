import ActionName from '../actions'

describe('Actions Module', () => {
    test('should export correct action names', () => {
        expect(ActionName.RESET).toBe('RESET')
        expect(ActionName.LOAD).toBe('LOAD')
        expect(ActionName.UPDATE_INVESTMENTS).toBe('UPDATE_INVESTMENTS')
        expect(ActionName.UPDATE_INFLATION).toBe('UPDATE_INFLATION')
        expect(ActionName.UPDATE_PLAN).toBe('UPDATE_PLAN')
    })

    test('should have all required action types', () => {
        const expectedActions = [
            'RESET',
            'LOAD',
            'UPDATE_INVESTMENTS',
            'UPDATE_INFLATION',
            'UPDATE_PLAN'
        ]

        expectedActions.forEach(action => {
            expect(ActionName).toHaveProperty(action)
            expect(typeof ActionName[action as keyof typeof ActionName]).toBe('string')
        })
    })

    test('should have unique action names', () => {
        const actionValues = Object.values(ActionName)
        const uniqueValues = Array.from(new Set(actionValues))

        expect(actionValues.length).toBe(uniqueValues.length)
    })
})
