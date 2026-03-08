async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@studiomystri.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.accessToken;
        if (!token) {
            console.log('Login failed:', loginData);
            return;
        }

        console.log('Fetching leads...');
        const leadsRes = await fetch('http://localhost:5000/api/v1/leads', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const leadsData = await leadsRes.json();
        console.log(`Leads Response HTTP ${leadsRes.status}:`, JSON.stringify(leadsData, null, 2));

        console.log('Fetching lead pipeline...');
        const pipeRes = await fetch('http://localhost:5000/api/v1/leads/pipeline', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const pipeData = await pipeRes.json();
        console.log(`Pipeline Response HTTP ${pipeRes.status}:`, JSON.stringify(pipeData, null, 2));

    } catch (e) {
        console.log('Error:', e.message);
    }
}
test();
