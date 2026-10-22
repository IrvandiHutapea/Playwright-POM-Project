# Playwright POM Project

Project latihan Playwright JavaScript berdasarkan materi yang dipelajari.

## 1. Install

```bash
npm install
npx playwright install chromium
```

## 2. Jalankan semua test

```bash
npm test
```

## 3. Jalankan headed

```bash
npm run test:headed
```

## 4. Debug

```bash
npm run test:debug
```

## 5. Test tertentu

```bash
npm run test:login
npm run test:product
npm run test:register
npm run test:contact
npm run test:logout
```

## 6. Lihat Playwright HTML Report

```bash
npm run report
```

## 7. Struktur

- `pages/` = Page Object
- `locators/` = Locator Class
- `tests/` = Test Case
- `utils/` = helper/config/report
- `test_data/` = test data
- `Reports/` = custom report JSON
- `reports/` = report generator

## 8. Catatan

Project memakai AutomationExercise sebagai website latihan.

Register menggunakan email random berbasis timestamp agar tidak bentrok dengan akun sebelumnya.

Test login yang disediakan adalah negative login supaya tidak membutuhkan akun eksternal milik user.

Jika website berubah atau sedang lambat, locator/timeout mungkin perlu disesuaikan.
## CI/CD Verification

This section verifies that GitHub Actions runs automatically when a Pull Request is created.

- Automated testing with Playwright.
- Individual PDF test reports generated using Python ReportLab.
- Test artifacts uploaded to GitHub Actions.
CI/CD push trigger verification: 2026-10-22 15:39:26
