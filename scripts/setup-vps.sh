#!/bin/bash
# Run this ONCE on a fresh Hostinger Ubuntu 22.04 VPS as root or sudo user
# Usage: bash setup-vps.sh YOUR_DOMAIN

set -e
DOMAIN=$1
APP_DIR="/var/www/studiomystri"
DB_NAME="studiomystri"
DB_USER="studiomystri_user"

if [ -z "$DOMAIN" ]; then echo "Usage: bash setup-vps.sh yourdomain.com"; exit 1; fi

echo "=== [1/9] System Update ==="
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw fail2ban

echo "=== [2/9] Install Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version && npm --version

echo "=== [3/9] Install PM2 ==="
npm install -g pm2
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

echo "=== [4/9] Install Nginx ==="
apt-get install -y nginx
systemctl enable nginx

echo "=== [5/9] Install PostgreSQL 16 ==="
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Create DB and user
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD 'CHANGE_THIS_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "PostgreSQL DB created: $DB_NAME | User: $DB_USER"

echo "=== [6/9] Configure Firewall ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "=== [7/9] Create App Directory + Log Dir ==="
mkdir -p $APP_DIR
mkdir -p /var/log/studiomystri
mkdir -p $APP_DIR/backend/uploads/{products,employees,team,company}
chown -R $SUDO_USER:$SUDO_USER $APP_DIR
chown -R $SUDO_USER:$SUDO_USER /var/log/studiomystri

echo "=== [8/9] Setup SSH Key for GitHub Actions ==="
# Generate deploy key (no passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f /home/$SUDO_USER/.ssh/deploy_key -N ""
echo ""
echo "=== ADD THIS PUBLIC KEY TO AUTHORIZED_KEYS ==="
cat /home/$SUDO_USER/.ssh/deploy_key.pub >> /home/$SUDO_USER/.ssh/authorized_keys
chmod 600 /home/$SUDO_USER/.ssh/authorized_keys
echo ""
echo "=== ADD THIS PRIVATE KEY TO GITHUB SECRETS AS VPS_SSH_KEY ==="
cat /home/$SUDO_USER/.ssh/deploy_key
echo ""

echo "=== [9/9] Install Certbot ==="
apt-get install -y certbot python3-certbot-nginx
echo ""
echo "=== SETUP COMPLETE ==="
echo "Next steps:"
echo "1. Clone your repo: cd /var/www && git clone git@github.com:YOUR_USER/StudioMystriBMS.git studiomystri"
echo "2. Set up backend/.env (see .env.example)"
echo "3. Run: cd /var/www/studiomystri/backend && npx prisma migrate deploy && npx prisma db seed"
echo "4. Copy nginx config: cp nginx/studiomystri.conf /etc/nginx/sites-available/studiomystri"
echo "5. Enable site: ln -s /etc/nginx/sites-available/studiomystri /etc/nginx/sites-enabled/"
echo "6. Get SSL: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "7. Start PM2: cd /var/www/studiomystri && pm2 start ecosystem.config.cjs --env production"
echo "8. Save PM2: pm2 save"
