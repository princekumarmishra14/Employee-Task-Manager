const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.user.create({
      data: {
        email: "test_uuid2@etm.com",
        passwordHash: "hash",
        roleId: "ccc67d3a-5aa7-4dc5-8737-96d8920d79d2", // valid
        departmentId: "dep-12345",
      }
    });
  } catch (e) {
    console.log(e.message);
  }
}
run();
