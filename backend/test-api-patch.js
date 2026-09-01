const axios = require('axios');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    // get a valid token directly by spoofing or using a known user
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "123", role: "SUPER_ADMIN", email: "superadmin@etm.com" }, "your_super_secret_jwt_signing_key_for_development_mode", { expiresIn: "1h" });

    const user = await prisma.user.findFirst({ where: { employee: { fullName: { contains: "Prakriti" } } } });
    if (!user) { console.log("User not found"); return; }
    
    console.log("Before:", user.email);

    const patchRes = await axios.patch(`http://localhost:5001/api/employees/${user.id}`, {
      email: 'prakriti.test@enterprise.com',
      fullName: 'Prakriti'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Patch Success:", patchRes.data.data.email);

    const check = await prisma.user.findUnique({ where: { id: user.id } });
    console.log("DB check:", check.email);

  } catch (err) {
    console.error(err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
