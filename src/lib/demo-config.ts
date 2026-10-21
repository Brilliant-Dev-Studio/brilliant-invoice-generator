// Public sandbox credentials; these are intentionally displayed on the login page.
export const DEMO_EMAIL = "demo@sanpya.com";
export const DEMO_PASSWORD = "SanPyaDemo2026!";
export const DEMO_COMPANY_ID = "c7887dd8-aad8-42f1-8ac5-8e66064d3c72";
export const DEMO_USER_ID = "b5b48423-f715-4e85-9985-6c128f411223";
export const DEMO_RESET_INTERVAL = 24 * 60 * 60 * 1000;

export function isDemoCompany(companyId: string) {
  return companyId === DEMO_COMPANY_ID;
}
