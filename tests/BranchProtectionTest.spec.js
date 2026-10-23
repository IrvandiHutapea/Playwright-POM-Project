import { test, expect } from '@playwright/test';

test('Branch protection should detect a failed test', async () => {
  expect(1).toBe(2);
});
