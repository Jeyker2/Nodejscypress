import test from '@playwright/test';
import { testHistogram } from './utils/histogram';
import { REGEX_HISTOGRAM } from './constants/regex';

test(REGEX_HISTOGRAM, async ({ page, context, browser }) => {
  await testHistogram(page, context);
  console.log(`${REGEX_HISTOGRAM} ejecutado en: ${browser.browserType().name()}`);
});