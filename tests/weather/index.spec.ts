import test from '@playwright/test';
import { testForecast } from './utils/forecast';
import { testRainglog } from './utils/rainlog';
import { REGEX_FORECAST, REGEX_RAINLOG } from './constants/regex';

test(REGEX_FORECAST, async ({ page, context, browser }) => {
  await testForecast(page, context);
  console.log(`testForescast ejecutado en: ${browser.browserType().name()}`);
});

test(REGEX_RAINLOG, async ({ page, context, browser }) => {
  await testRainglog(page, context);
  console.log(`testRainlog ejecutado en: ${browser.browserType().name()}`);
});