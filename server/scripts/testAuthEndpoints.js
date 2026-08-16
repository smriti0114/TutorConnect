

const BASE_URL = 'http://localhost:5050/api';

console.log('====================================================');
console.log('   TUTORCONNECT AUTH ENDPOINTS VERIFICATION TESTS   ');
console.log('====================================================');

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}`);
    failed++;
  }
}

async function run() {
  // Test 1: Register a new Parent
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Parent',
        email: `parent-${Date.now()}@example.com`,
        password: 'Demo123!',
        phone: '555-9999',
        role: 'parent',
        childName: 'Leo Junior',
        childAge: 6
      })
    });
    const regData = await regRes.json();
    assert('Register Parent succeeds', regRes.status === 201 && regData.message.includes('successful'));
  } catch (err) {
    console.error('Test 1 failed with error:', err.message);
    failed++;
  }

  // Test 2: Reject Admin self-registration
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Evil Admin',
        email: `admin-${Date.now()}@example.com`,
        password: 'Demo123!',
        phone: '555-6666',
        role: 'admin'
      })
    });
    const regData = await regRes.json();
    assert('Admin self-registration is blocked', regRes.status === 403 && regData.error.includes('blocked'));
  } catch (err) {
    console.error('Test 2 failed with error:', err.message);
    failed++;
  }

  // Test 3: Login as Seeded Parent
  let parentToken = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'parent@example.com',
        password: 'Demo123!'
      })
    });
    const loginData = await loginRes.json();
    parentToken = loginData.token;
    assert('Login parent@example.com returns token & correct role', 
      loginRes.status === 200 && parentToken && loginData.user.role === 'parent'
    );
  } catch (err) {
    console.error('Test 3 failed with error:', err.message);
    failed++;
  }

  // Test 4: Verify Auth Session /auth/me
  try {
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parentToken}`
      }
    });
    const meData = await meRes.json();
    assert('Session /auth/me returns matching parent info', 
      meRes.status === 200 && meData.email === 'parent@example.com' && meData.role === 'parent'
    );
  } catch (err) {
    console.error('Test 4 failed with error:', err.message);
    failed++;
  }

  // Test 5: Reject Bad Password Login
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'parent@example.com',
        password: 'WrongPassword!'
      })
    });
    const loginData = await loginRes.json();
    assert('Login with wrong password fails', loginRes.status === 400 && loginData.error.includes('credentials'));
  } catch (err) {
    console.error('Test 5 failed with error:', err.message);
    failed++;
  }

  console.log('====================================================');
  console.log(`TEST SUITE RESULTS: ${passed} Passed, ${failed} Failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
