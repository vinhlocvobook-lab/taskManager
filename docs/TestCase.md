# Test Cases - Authentication & Security

**Date:** 2026-03-17  
**Environment:** Development (MariaDB)  
**Test Results:** 26 tests | 26 PASSED

---

## Register Tests

| TC ID | Test Case | Expected | Actual | Status |
|-------|-----------|----------|--------|--------|
| TC-REG-001 | Register with valid data | 201 Created | 201 Created | ✅ PASS |
| TC-REG-002 | Register with duplicate email | 409 Conflict | 409 Conflict | ✅ PASS |
| TC-REG-003 | Register with missing email | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-REG-004 | Register with missing password | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-REG-005 | Register with short password (< 8 chars) | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-REG-006 | Register with no uppercase letter | 400 Bad Request | 400 Bad Request | ✅ PASS |

---

## Login Tests

| TC ID | Test Case | Expected | Actual | Status |
|-------|-----------|----------|--------|--------|
| TC-LOGIN-001 | Login with correct credentials | 200 OK | 200 OK | ✅ PASS |
| TC-LOGIN-002 | Login with wrong password | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| TC-LOGIN-003 | Login with non-existent email | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| TC-LOGIN-004 | Login with missing email | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-LOGIN-005 | Login with missing password | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-LOGIN-006 | Login with empty credentials | 400 Bad Request | 400 Bad Request | ✅ PASS |

---

## Password Complexity Tests

| TC ID | Test Case | Expected | Actual | Status |
|-------|-----------|----------|--------|--------|
| TC-PASS-001 | Password without lowercase | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-PASS-002 | Password without number | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-PASS-003 | Password without special character | 400 Bad Request | 400 Bad Request | ✅ PASS |
| TC-PASS-004 | Valid password | 201 Created | 201 Created | ✅ PASS |

---

## JWT Token Tests

| TC ID | Test Case | Expected | Actual | Status |
|-------|-----------|----------|--------|--------|
| TC-JWT-001 | Access token generated on register | Token exists | Token exists | ✅ PASS |
| TC-JWT-002 | Refresh token generated on register | Token exists | Token exists | ✅ PASS |
| TC-JWT-003 | Access protected route with valid token | 200 OK | 200 OK | ✅ PASS |
| TC-JWT-004 | Access protected route with invalid token | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| TC-JWT-005 | Access protected route without token | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| TC-JWT-006 | Token contains user payload | Payload valid | Payload valid | ✅ PASS |

---

## Security Tests

| TC ID | Test Case | Expected | Actual | Status |
|-------|-----------|----------|--------|--------|
| TC-SQL-001 | SQL injection in email | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| TC-SQL-002 | SQL injection in password | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| TC-XSS-001 | XSS in name field | 201 Created | 201 Created | ✅ PASS |

---

## Summary

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Register | 6 | 6 | 0 | 100% |
| Login | 6 | 6 | 0 | 100% |
| Password Complexity | 4 | 4 | 0 | 100% |
| JWT Token | 6 | 6 | 0 | 100% |
| Security | 3 | 3 | 0 | 100% |
| **Total** | **26** | **26** | **0** | **100%** |

---

## Test Data Used

- **Test Email:** `test-{timestamp}@example.com`
- **Test Password:** `Password123!` (meets all security requirements)
- **Test Name:** Test User
- **Test Organization:** Test Company

---

## Next Steps

- [x] Add password complexity validation tests ✅
- [x] Add JWT token validation tests ✅
- [x] Add SQL injection prevention tests ✅
- [ ] Add rate limiting tests
- [ ] Add frontend tests (React Testing Library)
- [ ] Add integration tests (E2E with Playwright)