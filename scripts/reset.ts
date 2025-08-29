// scripts/reset.ts
// Nếu anh đang dùng alias "@", giữ nguyên — nhưng nhớ thêm bước 2 bên dưới
import prisma from "@/lib/prisma";  // ✅ default import

async function main() {
  await prisma.product.updateMany({ data: { status: "ACTIVE" } });
  await prisma.inventory.updateMany({ data: { quantity: 1 } });
  console.log("✅ Reset xong: Products ACTIVE + Inventory = 1");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
