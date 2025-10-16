import test from '@playwright/test';
import { testcropStatus } from './utils/cropstatus';
import { testcropStatusTandP } from './utils/cropstatusTandP';
import { REGEX_CROP_STATUS, REGEX_CROP_STATUS_TandP } from './constants/regex';

test(REGEX_CROP_STATUS, async ({ page, context, browser }) => {
  test.setTimeout(120000);
  await testcropStatus(page, context);
  console.log(`${REGEX_CROP_STATUS} ejecutado en: ${browser.browserType().name()}`);
});

test(REGEX_CROP_STATUS_TandP + ' - Tº y Pº', async ({ page, context, browser }) => {
  test.setTimeout(120000);
  await testcropStatusTandP(page, context);
  console.log(`${REGEX_CROP_STATUS_TandP} - Tº y Pº ejecutado en: ${browser.browserType().name()}`);
});