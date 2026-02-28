const { exec } = require('child_process');

function checkUpdates() {
    exec('cd /var/www/studiomystri/StudioMystri && git fetch origin main && git status -uno', (err, stdout, stderr) => {
        if (stdout && stdout.includes('Your branch is behind')) {
            console.log("Updates detected. Running deploy script...");
            exec('bash /var/www/studiomystri/autodeploy.sh', (errDeploy, out, errOut) => {
                if (errDeploy) {
                    console.error("Deploy failed:", errDeploy);
                } else {
                    console.log("Deploy finished successfully.");
                }
            });
        }
    });
}

// Poll every 60 seconds
setInterval(checkUpdates, 60000);
console.log("Polling service started.");
checkUpdates();
