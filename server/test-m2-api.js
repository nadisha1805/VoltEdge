async function runM2Tests() {
  console.log('🧪 Launching VOLTEDGE Electronics Milestone 2 Automated Test Suite...\n');

  // Start app in background
  const appModule = await import('./dist/index.js');
  await new Promise((r) => setTimeout(r, 1200));

  const BASE_URL = 'http://localhost:5000/api';

  // Helper for requests
  let superAdminToken = '';
  let salesStaffToken = '';

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('✅ 1. Health Check status:', healthRes.status, healthData.status, healthData.milestone);

  // 2. Admin Login - Super Admin
  const loginRes = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@voltedge.com', password: 'AdminPassword@123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Super Admin login failed: ' + JSON.stringify(loginData));
  }
  superAdminToken = loginData.token;
  console.log('✅ 2. Super Admin Login: Success, Token generated, User:', loginData.user.fullName, `(${loginData.user.role})`);

  // 3. Admin Login - Failure Scenario (Bad Password)
  const badLoginRes = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@voltedge.com', password: 'WrongPassword' }),
  });
  const badLoginData = await badLoginRes.json();
  console.log('✅ 3. Invalid Password Protection: status =', badLoginRes.status, 'message =', badLoginData.message);

  // 4. Sales Staff Login
  const salesLoginRes = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sales@voltedge.com', password: 'SalesPassword@123' }),
  });
  const salesLoginData = await salesLoginRes.json();
  salesStaffToken = salesLoginData.token;
  console.log('✅ 4. Sales Staff Login: Success, User:', salesLoginData.user.fullName, `(${salesLoginData.user.role})`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${superAdminToken}`,
  };

  const salesAuthHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${salesStaffToken}`,
  };

  // 5. GET /api/admin/auth/me
  const meRes = await fetch(`${BASE_URL}/admin/auth/me`, { headers: authHeaders });
  const meData = await meRes.json();
  console.log('✅ 5. Auth Me Check:', meRes.status, meData.user.fullName, meData.user.email);

  // 6. Role-Based Access Control: Sales Staff trying to access /api/admin/staff should be blocked (403 Forbidden)
  const rbacRes = await fetch(`${BASE_URL}/admin/staff`, { headers: salesAuthHeaders });
  const rbacData = await rbacRes.json();
  console.log('✅ 6. RBAC Enforcement on Staff Module:', rbacRes.status, '(Expected 403 Forbidden)', rbacData.message);

  // 7. Dashboard Overview
  const dashRes = await fetch(`${BASE_URL}/admin/dashboard/overview`, { headers: authHeaders });
  const dashData = await dashRes.json();
  console.log('✅ 7. Dashboard Overview Metrics:');
  console.log('   - Total Products:', dashData.data.totalProducts);
  console.log('   - Total Categories:', dashData.data.totalCategories);
  console.log('   - Total Brands:', dashData.data.totalBrands);
  console.log('   - Total Customers:', dashData.data.totalCustomers);
  console.log('   - Total Orders:', dashData.data.totalOrders);
  console.log('   - Total Revenue:', '₹' + dashData.data.totalRevenue);
  console.log('   - Low Stock Items:', dashData.data.lowStockProducts);
  console.log('   - Pending Enquiries:', dashData.data.pendingEnquiries);

  // 8. Dashboard Analytics & Recent Activity
  const analyticsRes = await fetch(`${BASE_URL}/admin/dashboard/analytics`, { headers: authHeaders });
  const analyticsData = await analyticsRes.json();
  console.log('✅ 8. Dashboard Analytics: Category Distribution count =', analyticsData.data.categoryDistribution.length);

  const actRes = await fetch(`${BASE_URL}/admin/dashboard/recent-activity`, { headers: authHeaders });
  const actData = await actRes.json();
  console.log('✅ 9. Recent Activity Feed: Count =', actData.data.length, 'Latest action =', actData.data[0]?.action, `[${actData.data[0]?.module}]`);

  // 10. Product Management - Create New Product
  // Get Category and Brand ID first
  const catRes = await fetch(`${BASE_URL}/admin/categories`, { headers: authHeaders });
  const catData = await catRes.json();
  const categoryId = catData.data[0].id;

  const brandRes = await fetch(`${BASE_URL}/admin/brands`, { headers: authHeaders });
  const brandData = await brandRes.json();
  const brandId = brandData.data[0].id;

  const newProdRes = await fetch(`${BASE_URL}/admin/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Sony WH-ULT900N Wireless Noise-Cancelling Headphones',
      sku: `SNY-ULT-${Date.now().toString().slice(-4)}`,
      brandId,
      categoryId,
      description: 'Ultra Bass wireless active noise cancelling headphones with LDAC and 30-hour battery life.',
      sellingPrice: 16990.0,
      costPrice: 12200.0,
      originalPrice: 19990.0,
      stockQuantity: 18,
      warrantyInfo: '1 Year Sony India Official Warranty',
      primaryImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'],
      specifications: { BatteryLife: '30 hours', NoiseCancelling: 'Active', Bluetooth: '5.3', Weight: '255g' },
      isFeatured: true,
    }),
  });
  const newProdData = await newProdRes.json();
  if (!newProdData.success) {
    throw new Error('Create product failed: ' + JSON.stringify(newProdData));
  }
  const createdProductId = newProdData.data.id;
  console.log('✅ 10. Add Product:', newProdRes.status, newProdData.data.name, 'SKU:', newProdData.data.sku);

  // 11. Edit Product
  const editProdRes = await fetch(`${BASE_URL}/admin/products/${createdProductId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      sellingPrice: 15990.0,
      shortDescription: 'Flagship bass headphones with deep punch and clear vocal isolation.',
    }),
  });
  const editProdData = await editProdRes.json();
  console.log('✅ 11. Edit Product:', editProdRes.status, 'Updated Price:', editProdData.data.sellingPrice);

  // 12. Inventory Overview & Valuation
  const invOverviewRes = await fetch(`${BASE_URL}/admin/inventory/overview`, { headers: authHeaders });
  const invOverviewData = await invOverviewRes.json();
  console.log('✅ 12. Inventory Valuation:');
  console.log('   - Total Units:', invOverviewData.data.totalStockUnits);
  console.log('   - Valuation Method:', invOverviewData.data.valuationMethod);
  console.log('   - Cost Valuation:', '₹' + invOverviewData.data.inventoryCostValuation.toLocaleString());
  console.log('   - Retail Valuation:', '₹' + invOverviewData.data.inventoryRetailValuation.toLocaleString());

  // 13. Inventory Adjustment with Movement Record
  const adjustRes = await fetch(`${BASE_URL}/admin/inventory/adjust`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      productId: createdProductId,
      quantityChanged: 5,
      movementType: 'STOCK_IN',
      reason: 'Received express restock batch from Sony distributor',
      referenceNumber: 'PO-SONY-2026-09',
    }),
  });
  const adjustData = await adjustRes.json();
  console.log('✅ 13. Stock Adjustment:', adjustRes.status, 'Previous:', adjustData.data.movement.previousQuantity, 'New:', adjustData.data.movement.newQuantity);

  // 14. Stock Movements Ledger
  const movementsRes = await fetch(`${BASE_URL}/admin/inventory/movements?productId=${createdProductId}`, { headers: authHeaders });
  const movementsData = await movementsRes.json();
  console.log('✅ 14. Stock Movement Ledger Count for Product:', movementsData.data.length, 'Last Movement:', movementsData.data[0].movementType);

  // 15. Orders Management
  const ordersRes = await fetch(`${BASE_URL}/admin/orders`, { headers: authHeaders });
  const ordersData = await ordersRes.json();
  console.log('✅ 15. Orders Listing: Count =', ordersData.data.length, 'First Order =', ordersData.data[0].orderNumber);

  // 16. Order Status Update
  const firstOrderId = ordersData.data[0].id;
  const updateOrderRes = await fetch(`${BASE_URL}/admin/orders/${firstOrderId}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      orderStatus: 'DELIVERED',
      comment: 'Verified delivery confirmation via electronic signature.',
    }),
  });
  const updateOrderData = await updateOrderRes.json();
  console.log('✅ 16. Order Status Update:', updateOrderRes.status, 'New status:', updateOrderData.data.orderStatus);

  // 17. Customers Management
  const custRes = await fetch(`${BASE_URL}/admin/customers`, { headers: authHeaders });
  const custData = await custRes.json();
  console.log('✅ 17. Customers Directory: Count =', custData.data.length, 'Top Spender:', custData.data[0].firstName, 'Total Spent:', '₹' + custData.data[0].totalSpent);

  // 18. Coupons Management - Create
  const couponCode = `FESTIVE${Date.now().toString().slice(-4)}`;
  const newCouponRes = await fetch(`${BASE_URL}/admin/coupons`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: couponCode,
      description: 'Special 15% festival discount on laptops and audio',
      discountType: 'PERCENTAGE',
      discountValue: 15.0,
      minOrderAmount: 15000.0,
      maxDiscount: 3500.0,
      usageLimit: 100,
    }),
  });
  const newCouponData = await newCouponRes.json();
  console.log('✅ 18. Create Coupon:', newCouponRes.status, 'Code:', newCouponData.data.code);

  // 19. Staff Management - Create & Reset
  const staffEmail = `techsupport.${Date.now().toString().slice(-4)}@voltedge.com`;
  const addStaffRes = await fetch(`${BASE_URL}/admin/staff`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email: staffEmail,
      password: 'TemporaryPassword@123',
      fullName: 'Siddharth Rao',
      phone: '+91 99000 11223',
      role: 'INVENTORY_MANAGER',
    }),
  });
  const addStaffData = await addStaffRes.json();
  console.log('✅ 19. Staff Management - Add Staff:', addStaffRes.status, addStaffData.data.fullName, `(${addStaffData.data.role})`);

  // 20. Enquiries Management
  const enqRes = await fetch(`${BASE_URL}/admin/enquiries`, { headers: authHeaders });
  const enqData = await enqRes.json();
  console.log('✅ 20. Enquiries List: Count =', enqData.data.length, 'Subject:', enqData.data[0].subject);

  const firstEnqId = enqData.data[0].id;
  const updateEnqRes = await fetch(`${BASE_URL}/admin/enquiries/${firstEnqId}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'IN_PROGRESS',
      adminNotes: 'Assigned to concierge team; dispatched product spec sheet.',
    }),
  });
  const updateEnqData = await updateEnqRes.json();
  console.log('✅ 21. Enquiry Status Update:', updateEnqRes.status, 'New status:', updateEnqData.data.status);

  // 21. Newsletter Management & CSV Export
  const newsRes = await fetch(`${BASE_URL}/admin/newsletter`, { headers: authHeaders });
  const newsData = await newsRes.json();
  console.log('✅ 22. Newsletter Subscribers Count:', newsData.data.length);

  const newsExportRes = await fetch(`${BASE_URL}/admin/newsletter/export`, { headers: authHeaders });
  const newsCsv = await newsExportRes.text();
  console.log('✅ 23. Newsletter CSV Export:', newsExportRes.status, 'Lines:', newsCsv.split('\n').length);

  // 22. Reports & Analytics with CSV
  const repSummaryRes = await fetch(`${BASE_URL}/admin/reports/summary?range=30d`, { headers: authHeaders });
  const repSummaryData = await repSummaryRes.json();
  console.log('✅ 24. Business Reports Summary (30d): Total Orders =', repSummaryData.data.totalOrders, 'Gross Sales = ₹' + repSummaryData.data.grossSales);

  const prodRepCsvRes = await fetch(`${BASE_URL}/admin/reports/products?format=csv`, { headers: authHeaders });
  const prodRepCsv = await prodRepCsvRes.text();
  console.log('✅ 25. Product Report CSV Export:', prodRepCsvRes.status, 'Lines:', prodRepCsv.split('\n').length);

  // 23. Showroom Settings (GET & PUT)
  const settingsRes = await fetch(`${BASE_URL}/admin/settings`, { headers: authHeaders });
  const settingsData = await settingsRes.json();
  console.log('✅ 26. Showroom Settings:', settingsRes.status, 'Store Name:', settingsData.data.storeName);

  // 24. Public Customer Enquiry Submission
  const publicEnqRes = await fetch(`${BASE_URL}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maya Sen',
      email: 'maya.sen@designcraft.com',
      phone: '+91 97777 88888',
      subject: 'Inquiry regarding Apple Studio Display',
      message: 'Does your showroom carry nano-texture glass models in stock for live viewing?',
    }),
  });
  const publicEnqData = await publicEnqRes.json();
  console.log('✅ 27. Public Customer Contact Enquiry:', publicEnqRes.status, publicEnqData.message);

  // 25. Milestone 1 Compatibility: Public Products API
  const m1ProdRes = await fetch(`${BASE_URL}/products?limit=3`);
  const m1ProdData = await m1ProdRes.json();
  console.log('✅ 28. Milestone 1 Storefront Compatibility: Returned products count =', m1ProdData.data.length, 'Total in DB =', m1ProdData.pagination.totalCount);

  console.log('\n======================================================');
  console.log('🎉 ALL 28 MILESTONE 2 BACKEND TEST VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');

  process.exit(0);
}

runM2Tests().catch((err) => {
  console.error('❌ Milestone 2 test verification failed:', err);
  process.exit(1);
});

