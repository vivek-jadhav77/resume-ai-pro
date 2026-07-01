async function testAuth() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        email: "testuser1@test.com",
        password: "password123"
      })
    });
    const data = await res.json();
    console.log("Register successful:", data);

    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "testuser1@test.com",
        password: "password123"
      })
    });
    const loginData = await loginRes.json();
    console.log("Login successful:", loginData);
  } catch (err) {
    console.error("Auth Error:", err);
  }
}

testAuth();
