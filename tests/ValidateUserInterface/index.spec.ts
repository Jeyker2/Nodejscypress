import test from '@playwright/test';
import { testValidateUserInterface } from './utils/userinterface';
import { REGEX_USER_INTERFACE } from './constants/regex';

test(REGEX_USER_INTERFACE, async ({ page, context, browser }) => {
  test.setTimeout(120000);
  await testValidateUserInterface(page, context);
  console.log(`${REGEX_USER_INTERFACE} ejecutado en: ${browser.browserType().name()}`);
});