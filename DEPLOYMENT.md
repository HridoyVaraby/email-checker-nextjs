# Deployment Guide for Ubuntu VPS

This guide assumes you have SSH'd into your Ubuntu VPS and have cloned the repository.

## 1. Install Node.js (v20+)
Using `nvm` (Node Version Manager) is recommended to get the correct version.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Activate nvm (or close and reopen terminal)
source ~/.bashrc

# Install Node.js v22 (Latest LTS)
nvm install 22
nvm use 22

# Verify installation
node -v
npm -v
```

## 2. Install Project Dependencies
Navigate to your project folder (if not already there) and install packages.

```bash
cd email-checker-nextjs
npm install
```

## 3. Configure Environment Variables
Create the `.env` file. You can copy the example or create a new one.

```bash
# Create .env file
nano .env
```

Paste the following content (modify `DATABASE_URL` if needed, but the default SQLite file is fine):

```env
DATABASE_URL="file:./dev.db"
# Optional: Add any other secrets here
```

Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit.

## 4. Setup Database
Initialize the SQLite database and generate the Prisma Client.

```bash
# Generate the Prisma Client (Fixes "Module not found" errors)
npx prisma generate

# Create the database tables
npx prisma migrate deploy
```

## 5. Run the Server

### Option A: Development Mode (easiest for testing)
Runs on port 3000 by default.

```bash
npm run dev
```

*   Access via: `http://YOUR_VPS_IP:3000`
*   **Note**: If port 3000 is blocked by the VPS firewall, you may need to allow it:
    ```bash
    sudo ufw allow 3000
    ```

### Option B: Production (Faster & More Stable)

```bash
# Build the application
npm run build

# Start the server
npm start
```

## 6. Keeping it Running (Optional)
To keep the server running after you close the terminal, use `pm2`.

```bash
npm install -g pm2
pm2 start npm --name "email-checker" -- start
```

## Troubleshooting Port 25
If you still see "Unknown" results, check if your VPS provider blocks Port 25.

```bash
telnet gmail-smtp-in.l.google.com 25
```
If it hangs or says "Connection refused", you need to request your provider (AWS, DigitalOcean, etc.) to unblock Port 25 for your account.
