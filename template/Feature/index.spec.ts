import test from '@playwright/test';
import { testExample } from './utils/testExample';
import { REGEX_EXAMPLE } from './constants/regex';

test(REGEX_EXAMPLE, async ({ page, context, browser }) => {
  await testExample(page);
  console.log(`${REGEX_EXAMPLE} ejecutado en: ${browser.browserType().name()}`);
});