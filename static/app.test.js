import app from './app.js';

test('exports geocode and calculateRoute functions', () => {
  expect(typeof app.geocode).toBe('function');
  expect(typeof app.calculateRoute).toBe('function');
});
