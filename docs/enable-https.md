# How to enable HTTPS for futebolanalyticspro.com.br (Ubuntu + Nginx)

This guide shows how to install a free TLS certificate from Let's Encrypt using Certbot on an Ubuntu VPS (Hostinger or similar). If you use Apache, swap `nginx` for `apache` in the commands and follow the Apache prompts.

> Note: You must have the domain `futebolanalyticspro.com.br` pointing to your VPS public IP (A record). If you use `www`, create a `www` CNAME or A record as appropriate.

## 1) SSH into your VPS

Replace with your actual username and VPS IP address:

```bash
ssh your-user@your-vps-ip
```

## 2) Install Certbot and the Nginx plugin

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

(If you use Apache, install `python3-certbot-apache` instead.)

## 3) Obtain and install the certificate

This command will request and automatically configure the certificate for your Nginx virtual host(s):

```bash
sudo certbot --nginx -d futebolanalyticspro.com.br -d www.futebolanalyticspro.com.br
```

Follow the interactive prompts.
- Choose the option to redirect HTTP traffic to HTTPS when asked.

If Certbot cannot find an Nginx server block, ensure your site is properly configured in `/etc/nginx/sites-available/` and enabled via `sites-enabled`.

## 4) Verify HTTPS in the browser

Visit:

- https://futebolanalyticspro.com.br
- https://www.futebolanalyticspro.com.br

You should see the padlock icon.

## 5) Automatic renewal (Let’s Encrypt)

Certbot installs a system timer/cron job to renew certificates automatically. To test renewal manually:

```bash
sudo certbot renew --dry-run
```

## 6) Optional: Test your TLS configuration

Use the SSL Labs test:

https://www.ssllabs.com/ssltest/

Or verify in the browser devtools > Security tab.

## Troubleshooting

- `Domain not pointing to server`: Ensure DNS A record points to your VPS IP and allow time for propagation.
- `Certbot can't find a server block`: Create an Nginx server block for your domain and reload Nginx (`sudo nginx -t && sudo systemctl reload nginx`).
- `Port 80 blocked`: Ensure firewall allows inbound HTTP (port 80) and HTTPS (443). For `ufw`:

```bash
sudo ufw allow 'Nginx Full'
```

## Apache notes

If you run Apache, use these commands instead:

```bash
sudo apt update
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d futebolanalyticspro.com.br -d www.futebolanalyticspro.com.br
```

Follow interactive prompts and choose the redirect to HTTPS option.

---

If you want, I can add a small checklist to the PR describing these steps and suggest adding a repository secret or deployment note for Hostinger. If you prefer I can also create an Ansible snippet or a tiny deploy script that automates the certbot installation and renewal checks.