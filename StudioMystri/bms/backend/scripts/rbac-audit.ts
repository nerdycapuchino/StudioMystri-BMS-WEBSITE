async function audit() {
    const API_BASE = 'http://localhost:5000/api/v1';
    console.log('--- 🛡️ Studio Mystri RBAC Audit ---');

    // 1. Designer Login
    console.log('\n[1] Testing DESIGNER permissions...');
    let designerToken = '';
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'designer@studiomystri.com', password: 'Designer@1234' })
        });
        const data: any = await res.json();
        if (data.success) {
            designerToken = data.data.accessToken;
            console.log('✅ Designer logged in successfully');
        } else {
            console.error('❌ Designer login failed:', data.message);
        }
    } catch (err: any) {
        console.error('❌ Designer login failed:', err.message);
    }

    // 2. Try Finance as Designer
    if (designerToken) {
        console.log('[2] Attempting unauthorized access to Finance...');
        try {
            const res = await fetch(`${API_BASE}/finance`, { headers: { Authorization: `Bearer ${designerToken}` } });
            if (res.status === 403) {
                console.log('✅ SUCCESS: Designer rejected from Finance with 403 Forbidden');
            } else if (res.status === 200) {
                console.error('❌ FAILURE: Designer accessed Finance!');
            } else {
                console.log(`⚠️  Response: ${res.status}`);
            }
        } catch (err: any) {
            console.error('⚠️  Error:', err.message);
        }

        // 3. Try TeamHub as Designer
        console.log('[3] Attempting authorized access to TeamHub...');
        try {
            const res = await fetch(`${API_BASE}/team/channels`, { headers: { Authorization: `Bearer ${designerToken}` } });
            if (res.status === 200) {
                const data: any = await res.json();
                console.log('✅ SUCCESS: Designer accessed TeamHub (Channels count:', (data.data || data).length, ')');
            } else {
                console.error(`❌ FAILURE: TeamHub blocked with ${res.status}`);
            }
        } catch (err: any) {
            console.error('⚠️  Error:', err.message);
        }
    }

    // 4. Admin Login
    console.log('\n[4] Testing SUPER_ADMIN permissions...');
    let adminToken = '';
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'it-support@studiomystri.com', password: 'SuperAdmin@1234' })
        });
        const data: any = await res.json();
        if (data.success) {
            adminToken = data.data.accessToken;
            console.log('✅ SUPER_ADMIN logged in successfully');
        } else {
            console.error('❌ Admin login failed:', data.message);
        }
    } catch (err: any) {
        console.error('❌ Admin login failed:', err.message);
    }

    // 5. Try HR as Admin
    if (adminToken) {
        console.log('[5] Attempting access to HR as Admin...');
        try {
            const res = await fetch(`${API_BASE}/hr/employees`, { headers: { Authorization: `Bearer ${adminToken}` } });
            if (res.status === 200) {
                console.log('✅ SUCCESS: SUPER_ADMIN accessed HR module');
            } else {
                console.error(`❌ FAILURE: Admin blocked from HR with ${res.status}`);
            }
        } catch (err: any) {
            console.error('⚠️  Error:', err.message);
        }
    }

    process.exit(0);
}

audit();
