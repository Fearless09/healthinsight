import { seedDemoData } from './seed';

async function main() {
  await seedDemoData();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
