import test from '@playwright/test';
import { testLogin } from './utils/login';
import { LOGIN_REGEX } from './constants/regex';

test(LOGIN_REGEX, async ({ page, context, browser }) => {
  await testLogin(page);
  console.log(`${LOGIN_REGEX} ejecutado en: ${browser.browserType().name()}`);
});