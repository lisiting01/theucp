/**
 * 一次性迁移脚本：将数据库中的章程内容迁移到文件
 *
 * 使用方法：
 * npx tsx scripts/migrate-charter-to-files.ts
 */

import { PrismaClient } from "../src/generated/prisma/index.js";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Starting charter migration to files...\n");

  // 获取所有章程版本
  const versions = await prisma.charterVersion.findMany({
    orderBy: { versionNo: "asc" },
  });

  console.log(`📊 Found ${versions.length} charter version(s) in database\n`);

  // 确保目录存在
  const charterDir = path.join(process.cwd(), "public", "charter");
  await fs.mkdir(charterDir, { recursive: true });

  // 迁移每个版本
  for (const version of versions) {
    const filePath = path.join(charterDir, `charter-v${version.versionNo}.md`);

    // @ts-expect-error - content field will be removed after migration
    const content = version.content || "# Charter content missing";

    try {
      await fs.writeFile(filePath, content, "utf-8");
      console.log(`✅ Migrated v${version.versionNo} → ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to write v${version.versionNo}:`, error);
    }
  }

  console.log("\n✨ Migration completed!");
  console.log("\nNext steps:");
  console.log("1. Verify files in public/charter/");
  console.log("2. Run: npx prisma db push --accept-data-loss");
  console.log("3. Run: npx prisma generate");
}

migrate()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
