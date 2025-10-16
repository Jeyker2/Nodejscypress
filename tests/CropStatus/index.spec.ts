import test from '@playwright/test';
import { testcropStatus } from './utils/cropstatus';
import { REGEX_CROP_STATUS } from './constants/regex';

test(REGEX_CROP_STATUS, async ({ page, context, browser }) => {
  test.setTimeout(120000);
  await testcropStatus(page, context);
  console.log(`${REGEX_CROP_STATUS} ejecutado en: ${browser.browserType().name()}`);
});