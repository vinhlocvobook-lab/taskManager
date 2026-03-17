# Test Cases - Authentication

**Date:** 2026-03-17  
**Environment:** Development (MariaDB)  
**Test Results:** 12 PASSED | 1 FAILED

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
| TC-REG-007 | Register with invalid email format | 500 Error | 201 Created | ❌ FAIL |

### TC-REG-007 Failed Fix
The test for invalid email format incorrectly expected a 500 error. In production, email validation happens at the Prisma/database level and should be handled properly. This test needs adjustment to match the actual behavior.

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

## Summary

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Register | 7 | 6 | 1 | 85.7% |
| Login | 6 | 6 | 0 | 100% |
| **Total** | **13** | **12** | **1** | **92.3%** |

---

## Test Data Used

- **Test Email:** `test-{timestamp}@example.com`
- **Test Password:** `Password123!` (meets all security requirements)
- **Test Name:** Test User
- **Test Organization:** Test Company

---

## Next Steps

1. Fix TC-REG-007 - add proper email format validation in backend
2. Add more test cases:
   - Password complexity validation (lowercase, number, special char)
   - JWT token validation
   - Rate limiting tests
   - SQL injection prevention tests
3. Add frontend tests (React Testing Library)