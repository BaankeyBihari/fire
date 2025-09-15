const mockSession = {
    user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
    },
    expires: '2024-12-31',
}

module.exports = {
    useSession: jest.fn(() => ({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(() => Promise.resolve(null)),
    getProviders: jest.fn(() => Promise.resolve({})),
    getServerSession: jest.fn(() => Promise.resolve(null)),
    SessionProvider: ({ children }) => children,
}
