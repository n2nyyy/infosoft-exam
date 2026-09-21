import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000';
const adminUsername = 'alexis';
const adminPassword = 'admin123';

function uniqueValue(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function futureDateFromDays(offsetDays: number) {
  return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function selectOptionByText(page: any, selector: string, optionText: string) {
  const option = page.locator(`${selector} option`).filter({ hasText: optionText }).first();
  const value = await option.getAttribute('value');
  if (!value) {
    throw new Error(`Could not find option containing text: ${optionText}`);
  }
  await page.locator(selector).selectOption({ value });
}

async function fillBookingHoursForService(page: any, serviceName: string, hours: string) {
  const row = page.locator('tbody tr').filter({ hasText: serviceName }).first();
  await expect(row).toBeVisible();
  await row.locator('input[name="hours_rendered[]"]').fill(hours);
}

async function loginAsAdmin(page: any) {
  await page.goto(`${baseURL}/login`);
  await page.locator('input[name="username"]').fill(adminUsername);
  await page.locator('input[name="password"]').fill(adminPassword);
  await page.getByRole('button', { name: /Log In to Portal/i }).click();
  await expect(page).toHaveURL(/\/bookings$/);
}

test.describe('Alexis Construction portal', () => {
  test('public booking page loads and accepts a new client service request', async ({ page }) => {
    const serviceName = `Playwright Service ${uniqueValue('svc')}`;
    const clientName = `Playwright Visitor ${uniqueValue('client')}`;
    const date = futureDateFromDays(30 + Math.floor(Math.random() * 30));

    await loginAsAdmin(page);
    await page.goto(`${baseURL}/services`);
    await page.locator('input[name="service_name"]').fill(serviceName);
    await page.locator('input[name="hourly_rate"]').fill('320');
    await page.getByRole('button', { name: /Save New Service/i }).click();
    await expect(page.getByText(serviceName)).toBeVisible();

    await page.goto(`${baseURL}/`);
    await expect(page.getByRole('heading', { name: /Book a Visit & Schedule Service/i })).toBeVisible();
    await selectOptionByText(page, 'select[name="service_id"]', serviceName);
    await page.locator('input[name="name"]').fill(clientName);
    await page.locator('input[name="contact"]').fill('09170000001');
    await page.locator('input[name="address"]').fill('Davao City, Philippines');
    await page.locator('input[name="estimated_hours"]').fill('3');
    await page.locator('input[name="schedule_date"]').fill(date);
    await page.getByRole('button', { name: /Submit Service Request/i }).click();

    await expect(page).toHaveURL(/\/?success=true/);
    await expect(page.getByText(/Booking Submitted!/i)).toBeVisible();
  });

  test('admin login works and bookings dashboard is accessible', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('link', { name: /Clients/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Services & Rates/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Inventory/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Bookings/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Process Billing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Reports/i })).toBeVisible();
  });

  test('admin can create, edit, and view client records', async ({ page }) => {
    const clientName = `Client ${uniqueValue('edit')}`;
    const updatedName = `${clientName}-Updated`;

    await loginAsAdmin(page);
    await page.goto(`${baseURL}/clients`);
    await page.locator('input[name="name"]').fill(clientName);
    await page.locator('input[name="contact"]').fill('09171234567');
    await page.getByRole('button', { name: /Save Client Record/i }).click();

    await expect(page.getByText(clientName)).toBeVisible();

    const row = page.locator('tbody tr').filter({ hasText: clientName }).first();
    await row.getByRole('link', { name: /Edit/i }).click();
    await page.locator('input[name="name"]').fill(updatedName);
    await page.getByRole('button', { name: /Update Record/i }).click();

    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(clientName, { exact: true })).toHaveCount(0);
  });

  test('admin can manage service rates and inventory entries', async ({ page }) => {
    const serviceName = `Service ${uniqueValue('rate')}`;
    const toolName = `Tool ${uniqueValue('tool')}`;

    await loginAsAdmin(page);
    await page.goto(`${baseURL}/services`);
    await page.locator('input[name="service_name"]').fill(serviceName);
    await page.locator('input[name="hourly_rate"]').fill('450');
    await page.getByRole('button', { name: /Save New Service/i }).click();
    await expect(page.getByText(serviceName)).toBeVisible();

    await page.goto(`${baseURL}/inventory`);
    await selectOptionByText(page, 'select[name="service_id"]', serviceName);
    await page.locator('input[name="tool_name"]').fill(toolName);
    await page.locator('input[name="stock"]').fill('8');
    await page.getByRole('button', { name: /Save Tool/i }).click();
    await expect(page.getByText(toolName)).toBeVisible();
  });

  test('admin can access booking, payment processing, and reports pages', async ({ page }) => {
    const clientName = `Report Client ${uniqueValue('report')}`;
    const serviceName = `Report Service ${uniqueValue('reportsvc')}`;
    const bookingDate = futureDateFromDays(45 + Math.floor(Math.random() * 30));

    await loginAsAdmin(page);
    await page.goto(`${baseURL}/services`);
    await page.locator('input[name="service_name"]').fill(serviceName);
    await page.locator('input[name="hourly_rate"]').fill('600');
    await page.getByRole('button', { name: /Save New Service/i }).click();

    await page.goto(`${baseURL}/clients`);
    await page.locator('input[name="name"]').fill(clientName);
    await page.locator('input[name="contact"]').fill('09170000099');
    await page.getByRole('button', { name: /Save Client Record/i }).click();

    await page.goto(`${baseURL}/bookings`);
    await selectOptionByText(page, 'select[name="client_id"]', clientName);
    await page.locator('input[name="schedule_date"]').fill(bookingDate);
    await fillBookingHoursForService(page, serviceName, '2');
    await page.getByRole('button', { name: /Confirm Schedule|Generate Billing/i }).click();

    await page.goto(`${baseURL}/process`);
    await expect(page.getByText(/Process Billing/i)).toBeVisible();

    await page.goto(`${baseURL}/reports`);
    await selectOptionByText(page, 'select[name="client_id"]', clientName);
    await page.getByRole('button', { name: /Generate Official Statement/i }).click();
    await expect(page.locator('.statement-card').getByText(clientName, { exact: true })).toBeVisible();
  });
});
