const API_URL = 'http://localhost:5000';
let token = '';

async function testAPIs() {
  console.log('🚀 Starting End-to-End API Test...');

  try {
    // 1. Auth Test (Login)
    console.log('\n--- 1. Auth Test ---');
    try {
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@smartpharmacy.com',
          password: 'admin123'
        })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');
      token = loginData.token;
      console.log('✅ Login successful');
    } catch (err) {
      console.log('❌ Login failed:', err.message);
      return;
    }

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Medicines Test
    console.log('\n--- 2. Medicines Test ---');
    try {
      const medsRes = await fetch(`${API_URL}/api/medicines`);
      const medsData = await medsRes.json();
      console.log(`✅ Fetched ${medsData.length} medicines`);
    } catch (err) {
      console.log('❌ Medicines fetch failed');
    }

    // 3. User Points Test
    console.log('\n--- 3. User Points Test ---');
    try {
      const pointsRes = await fetch(`${API_URL}/api/user/points`, { headers });
      const pointsData = await pointsRes.json();
      console.log(`✅ Current points: ${pointsData.points}`);
    } catch (err) {
      console.log('❌ Points fetch failed');
    }

    // 4. Notifications Test
    console.log('\n--- 4. Notifications Test ---');
    try {
      const notifRes = await fetch(`${API_URL}/api/notifications`, { headers });
      const notifData = await notifRes.json();
      console.log(`✅ Fetched ${notifData.length} notifications`);
    } catch (err) {
      console.log('❌ Notifications fetch failed');
    }

    // 5. Reminders Test
    console.log('\n--- 5. Reminders Test ---');
    try {
      const remRes = await fetch(`${API_URL}/api/reminders`, { headers });
      const remData = await remRes.json();
      console.log(`✅ Fetched ${remData.length} reminders`);
    } catch (err) {
      console.log('❌ Reminders fetch failed');
    }

    // 6. Orders Test (Create Order)
    console.log('\n--- 6. Orders Test ---');
    try {
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: [{ id: 1, name: 'Paracetamol', quantity: 2, price: 12.50 }],
          total_amount: 25.00,
          address: 'Test Address'
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order failed');
      console.log(`✅ Order created successfully: #ORD-${orderData.id}`);

      // Verify notification created
      const newNotifRes = await fetch(`${API_URL}/api/notifications`, { headers });
      const newNotifData = await newNotifRes.json();
      const orderNotif = newNotifData.find(n => n.title === 'Order Placed');
      if (orderNotif) {
        console.log('✅ Order notification verified');
      } else {
        console.log('❌ Order notification missing');
      }
    } catch (err) {
      console.log('❌ Order creation failed:', err.message);
    }

    console.log('\n✨ All API tests completed.');

  } catch (err) {
    console.error('💥 Critical test failure:', err.message);
  }
}

testAPIs();
