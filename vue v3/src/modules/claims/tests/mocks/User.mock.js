export const userMock = {
    id: '1737477088384577800',
    name: 'John Max',
    first_name: 'John',
    last_name: 'Max',
    email: 'john@max.me',
    username: 'john@max.me'
};

export const mountUserMock = {
    global: {
        provide: {
            currentUser: { value: userMock }
        }
    }
};
