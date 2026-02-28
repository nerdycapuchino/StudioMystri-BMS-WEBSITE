const axios = require('axios');

async function testTeamApi() {
    try {
        console.log('Logging in as admin...');
        const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'admin@studiomystri.com',
            password: 'password123',
        });

        const token = loginRes.data.data.accessToken;
        console.log('Got token:', token.substring(0, 20) + '...');

        console.log('Fetching team messages...');
        const msgsRes = await axios.get('http://localhost:5000/api/v1/team/messages?channel=general', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Success! Messages loaded:', msgsRes.data.data?.length || 0);

        console.log('Testing WebSocket connection...');
        const io = require('socket.io-client');
        const socket = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Socket connected successfully with ID:', socket.id);
            socket.emit('channel:join', 'general');
            setTimeout(() => {
                socket.emit('message:send', { channel: 'general', content: 'Test message from script' });
                console.log('Sent test message via socket');
                setTimeout(() => {
                    socket.disconnect();
                    process.exit(0);
                }, 1000);
            }, 500);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connect error:', err.message);
            process.exit(1);
        });

        socket.on('error', (err) => {
            console.error('Socket application error:', typeof err.details === 'string' ? err.details.substring(0, 200) + '...' : err);
            require('fs').writeFileSync('socket-error-dump.txt', err.details || JSON.stringify(err));
            // Don't exit immediately to let logs flush
        });

        socket.on('message:new', (msg) => {
            console.log('Received message back:', msg);
        });

    } catch (error) {
        console.error('API Error:', error.response?.status, error.response?.data);
        process.exit(1);
    }
}

testTeamApi();
