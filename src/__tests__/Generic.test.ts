import ActiveDataProvider from '../data/ActiveDataProvider';
test('ActiveDataProvider', () => {
    expect(new ActiveDataProvider({}).modelClass).toBe(new ActiveDataProvider({}).modelClass);
});
