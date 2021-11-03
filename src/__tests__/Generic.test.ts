import ActiveDataProvider from '../ActiveDataProvider';
test('ActiveDataProvider', () => {
  expect(new ActiveDataProvider({}).modelClass).toBe(new ActiveDataProvider({}).modelClass);
});
