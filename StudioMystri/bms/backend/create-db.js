const { Client } = require('pg');

async function setupDatabase() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
    });

    try {
        await client.connect();
        console.log('Connected as postgres user.');

        // Create role
        try {
            await client.query("CREATE ROLE studiomystri WITH LOGIN PASSWORD 'studiomystri_dev_2025' CREATEDB SUPERUSER");
            console.log('Role studiomystri created.');
        } catch (e) {
            if (e.message.includes('already exists')) console.log('Role exists.');
            else throw e;
        }

        // Create DB
        try {
            await client.query('CREATE DATABASE studiomystri_db OWNER studiomystri');
            console.log('Database studiomystri_db created.');
        } catch (e) {
            if (e.message.includes('already exists')) console.log('Database exists.');
            else throw e;
        }

    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();
