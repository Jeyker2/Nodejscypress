import test from '@playwright/test';
import { testForecast } from './utils/forecast';
import { testRainglog } from './utils/rainlog';
import { testallOpen } from './utils/allOpen';
import { REGEX_FORECAST, REGEX_RAINLOG, REGEX_ALL_OPEN } from './constants/regex';

test(REGEX_FORECAST, async ({ page, context, browser }) => {
  await testForecast(page, context);
  console.log(`testForescast ejecutado en: ${browser.browserType().name()}`);
});

test(REGEX_RAINLOG, async ({ page, context, browser }) => {
  await testRainglog(page, context);
  console.log(`testRainlog ejecutado en: ${browser.browserType().name()}`);
});

test(REGEX_ALL_OPEN, async ({ page, context, browser }) => {
  // Aquí puedes llamar a las funciones que desees ejecutar en este test
  await testallOpen(page, context);
  console.log(`allOpen ejecutado en: ${browser.browserType().name()}`);
});