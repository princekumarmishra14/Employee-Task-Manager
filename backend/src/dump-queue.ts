import prisma from "./lib/prisma";

async function main() {
  console.log("=== Database Email Queue Dump ===");
  const queue = await prisma.emailQueue.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (queue.length === 0) {
    console.log("No emails have been queued yet.");
    process.exit(0);
  }

  for (const item of queue) {
    console.log(`\n--------------------------------------------`);
    console.log(`ID: ${item.id}`);
    console.log(`To: ${item.to}`);
    console.log(`Subject: ${item.subject}`);
    console.log(`Status: ${item.status}`);
    console.log(`Attempts: ${item.attempts}/${item.maxAttempts}`);
    console.log(`Last Error: ${item.lastError || "None"}`);
    console.log(`Created At: ${item.createdAt}`);
  }
}

main().catch(console.error);
