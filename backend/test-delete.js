const axios = require('axios');
const jwt = require('jsonwebtoken');

// generate a superadmin token
const token = jwt.sign(
  { id: 'uuid-1234', role: 'SUPER_ADMIN', email: 'superadmin@etm.com' },
  'cY7JsCije9NceA+ADwHUZWBqUnzCTwnS/B2IutAFBzw=',
  { expiresIn: '1h' }
);

async function run() {
  try {
    const res = await axios.delete(
      'http://localhost:5001/api/departments/06f5095d-3d04-4cac-82be-444d36cbff81',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error status:", err.response ? err.response.status : err.message);
    console.log("Error data:", err.response ? err.response.data : '');
  }
}
run();
