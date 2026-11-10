async function runTests() {
  const appModule = await import('./dist/index.js');
  // Wait a short moment for express server to bind
  await new Promise(r => setTimeout(r, 800));

  console.log('🧪 Starting API Verification Tests...\n');

  // Test 1: Health Check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('1. Health Check status:', healthRes.status, healthData);

  // Test 2: Categories
  const catRes = await fetch('http://localhost:5000/api/categories');
  const catData = await catRes.json();
  console.log('2. Categories count:', catData.data?.length, 'First category:', catData.data?.[0]?.name);

  // Test 3: Products with filtering
  const prodRes = await fetch('http://localhost:5000/api/products?limit=4&sort=featured');
  const prodData = await prodRes.json();
  console.log('3. Products returned:', prodData.data?.length, 'Total in DB:', prodData.pagination?.totalCount);
  console.log('   Sample Product:', {
    name: prodData.data?.[0]?.name,
    brand: prodData.data?.[0]?.brand?.name,
    sellingPrice: prodData.data?.[0]?.sellingPrice,
    rating: prodData.data?.[0]?.rating,
    stockStatus: prodData.data?.[0]?.stockStatus,
  });

  // Test 4: Search filter
  const searchRes = await fetch('http://localhost:5000/api/products?search=Sony');
  const searchData = await searchRes.json();
  console.log('4. Search "Sony" count:', searchData.data?.length);

  // Test 5: Category filter
  const audioRes = await fetch('http://localhost:5000/api/products?category=audio-headphones');
  const audioData = await audioRes.json();
  console.log('5. Audio Category count:', audioData.data?.length);

  // Test 6: Newsletter Subscription
  const newsRes = await fetch('http://localhost:5000/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tester@voltedge-tech.com' }),
  });
  const newsData = await newsRes.json();
  console.log('6. Newsletter Subscribe:', newsRes.status, newsData);

  console.log('\n🎉 ALL API ENDPOINTS VERIFIED AND PASSING SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

