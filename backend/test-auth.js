const http = require('http');

const PORT = process.env.PORT || 5000;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Synexora Authentication Module Test ---');

  // Test 1: Health check
  console.log('1. Testing GET /api/health...');
  const healthRes = await request('GET', '/api/health');
  console.log('   Response Status:', healthRes.status, JSON.stringify(healthRes.body));
  if (healthRes.status !== 200) throw new Error('Health check failed');

  // Test 2: Register User
  const testEmail = `student_${Date.now()}@synexora.edu`;
  console.log(`2. Testing POST /api/auth/register with email: ${testEmail}...`);
  const registerRes = await request('POST', '/api/auth/register', {
    name: 'Ada Lovelace',
    email: testEmail,
    password: 'SuperSecretPassword2026!',
    major: 'Computer Science & AI',
    university: 'Oxford University',
  });
  console.log('   Register Status:', registerRes.status, registerRes.body.message);
  if (registerRes.status !== 201 || !registerRes.body.token) {
    throw new Error(`Register failed: ${JSON.stringify(registerRes.body)}`);
  }
  const token = registerRes.body.token;

  // Test 3: Login User
  console.log('3. Testing POST /api/auth/login...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: 'SuperSecretPassword2026!',
  });
  console.log('   Login Status:', loginRes.status, loginRes.body.message);
  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  }

  // Test 4: Protected GET /api/auth/me
  console.log('4. Testing GET /api/auth/me (Protected Route)...');
  const meRes = await request('GET', '/api/auth/me', null, token);
  console.log('   /me Status:', meRes.status, 'User Name:', meRes.body.user?.name);
  if (meRes.status !== 200 || meRes.body.user?.email !== testEmail) {
    throw new Error(`/me failed: ${JSON.stringify(meRes.body)}`);
  }

  // Test 5: Rejection on bad password
  console.log('5. Testing POST /api/auth/login with wrong password (expect 401)...');
  const badLoginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: 'WrongPassword!',
  });
  console.log('   Bad Login Status:', badLoginRes.status, badLoginRes.body.message);
  if (badLoginRes.status !== 401) {
    throw new Error('Bad login should return 401');
  }

  // Test 6: Profile update
  console.log('6. Testing PUT /api/auth/profile...');
  const updateRes = await request('PUT', '/api/auth/profile', {
    major: 'Quantum Computing & AI',
  }, token);
  console.log('   Profile Update Status:', updateRes.status, 'Updated Major:', updateRes.body.user?.major);
  if (updateRes.status !== 200 || updateRes.body.user?.major !== 'Quantum Computing & AI') {
    throw new Error('Profile update failed');
  }

  console.log('✅ ALL BACKEND AUTH TESTS PASSED PERFECTLY!');
}

// Start server in background for testing if needed
const appServer = require('./server');

setTimeout(async () => {
  try {
    await runTests();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test error:', err.message);
    process.exit(1);
  }
}, 1000);
