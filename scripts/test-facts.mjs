import fs from 'node:fs';
import path from 'node:path';

// Load site.ts directly or dynamically
// Let's create a test runner
async function run() {
  const { site, ANNOUNCING_SOON } = await import('../src/content/site.ts');
  const { buildMrDogFacts } = await import('../src/content/mrDogFacts.ts');

  const facts = buildMrDogFacts();
  console.log(`Length: ${facts.length} characters (budget <= 2500)`);
  console.log('--- FACTS ---');
  console.log(facts);

  // Assertions
  const checks = [
    { name: 'Contains Red Room Date', pass: facts.includes('Saturday, 24 October 2026') },
    { name: 'Contains Red Room Venue', pass: facts.includes('Millo') },
    { name: 'Contains Red Room Dress Code', pass: facts.includes('Costumes compulsory') },
    { name: 'Contains Red Room DJ', pass: facts.includes('DJ Monish') },
    { name: 'Contains Diwali Date', pass: facts.includes('Saturday, 7 November 2026') },
    { name: 'Contains Diwali Venue', pass: facts.includes('Hotel Centre Point, Nagpur') },
    { name: 'Contains Diwali DJ Announcing soon', pass: facts.includes('Announcing soon') },
    { name: 'Under 2500 chars', pass: facts.length <= 2500 },
  ];

  console.log('\n--- VERIFICATION CHECKS ---');
  let allPass = true;
  checks.forEach(c => {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.name}`);
    if (!c.pass) allPass = false;
  });

  if (!allPass) process.exit(1);
  console.log('\nAll facts checks PASSED!');
}

run().catch(console.error);
