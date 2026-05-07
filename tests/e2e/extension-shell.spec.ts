import { expect, test } from './fixtures/extension';

test('popup renders the control center', async ({ openExtensionPage }) => {
  const page = await openExtensionPage('popup.html');

  await expect(page.getByText('Control Center')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open workspace' })).toBeVisible();
});

test('options page renders profile workspace', async ({ openExtensionPage }) => {
  const page = await openExtensionPage('options.html');

  await expect(page.getByText('Workspace Preferences')).toBeVisible();
  await expect(page.getByText('Core Profile')).toBeVisible();
});

test('theme preference persists across extension surfaces', async ({ openExtensionPage }) => {
  const popupPage = await openExtensionPage('popup.html');
  await popupPage.getByRole('button', { name: 'dark' }).click();

  const optionsPage = await openExtensionPage('options.html');
  await expect
    .poll(async () => optionsPage.evaluate(() => document.documentElement.dataset.theme))
    .toBe('dark');
});

test('sidepanel route loads the operations dashboard shell', async ({ openExtensionPage }) => {
  const page = await openExtensionPage('sidepanel.html');

  await expect(page.getByText('Application Tracking')).toBeVisible();
  await expect(page.getByText('Extension Status')).toBeVisible();
});
