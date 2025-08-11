
import * as app from './app.js';


test('exports geocode and calculateRoute functions', () => {
  expect(typeof app.geocode).toBe('function');
  expect(typeof app.calculateRoute).toBe('function');
});

test('geocode returns error code on HTTP failure', async () => {
  global.fetch = jest.fn(async () => ({ ok: false, status: 403, json: async () => ({}) }));
  await expect(app.geocode('a', 'k')).rejects.toMatchObject({ code: 'GEOCODE_HTTP_403' });
});
