#!/usr/bin/env bash
# Server setup script for Ubuntu (run on the VPS as root or sudo)
set -euo pipefail

echo "Updating apt and installing required packages..."
apt update && apt upgrade -y

echo "Installing Node.js LTS and npm..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

echo "Installing git, nginx, certbot, and build deps..."
apt install -y git nginx certbot python3-certbot-nginx

echo "Installing pm2 globally..."
npm install -g pm2

echo "Creating application directory /var/www/FutebolAnalyticsPro..."
mkdir -p /var/www
cd /var/www

if [ ! -d FutebolAnalyticsPro ]; then
  echo "Cloning repository..."
  git clone https://github.com/salgadopuppa-cmd/FutebolAnalyticsPro.git
else
  echo "Repository already exists, pulling latest..."
  cd FutebolAnalyticsPro && git pull
fi

echo "Installing server dependencies..."
cd FutebolAnalyticsPro/server
npm ci --production

echo "Setup complete. You can start the app with pm2 or configure nginx and certbot as needed."

cat <<'EOF'
Example pm2 commands:
  cd /var/www/FutebolAnalyticsPro/server
  pm2 start index.js --name futebol-api
  pm2 save
  pm2 startup
EOF
