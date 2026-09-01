const axios = require('axios');

async function test() {
  try {
    // 1. Get token
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'superadmin@etm.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;

    // 2. Get user Prakriti/Patricia
    const empRes = await axios.get('http://localhost:5001/api/employees?search=patricia', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = empRes.data.data[0];
    console.log("Found user:", user.email, user.employee.fullName);

    // 3. Update user
    const patchRes = await axios.patch(`http://localhost:5001/api/employees/${user.id}`, {
      email: 'test.update@enterprise.com',
      fullName: 'Prakriti Test'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Update response:", patchRes.data.data.email, patchRes.data.data.employee.fullName);

    // 4. Revert
    await axios.patch(`http://localhost:5001/api/employees/${user.id}`, {
      email: user.email,
      fullName: user.employee.fullName
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Reverted.");
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
