module.exports = {
    default: jest.fn(() => ({})),
    authOptions: {
        providers: [],
        callbacks: {},
        pages: {},
        session: { strategy: 'jwt' }
    }
}
