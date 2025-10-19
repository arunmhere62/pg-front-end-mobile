# Setup API Connection for Physical Device

## Problem
When testing on your iPhone, `localhost` refers to the phone itself, not your computer. So the app can't reach your backend API.

## Solution

### Step 1: Find Your Computer's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).
Example: `192.168.1.105`

**On Mac:**
```bash
ifconfig | grep "inet "
```
Look for an IP like `192.168.1.xxx`

### Step 2: Update API Configuration

**Option A: Create `.env` file** (Recommended)

Create a file named `.env` in the `front-end` folder:

```bash
# Replace XXX.XXX.XXX.XXX with your computer's IP address
API_BASE_URL=http://192.168.1.105:3000/api/v1
```

**Option B: Update `api.config.ts` directly**

Edit `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.105:3000/api/v1', // Replace with your IP
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

### Step 3: Ensure Both Devices on Same WiFi

- Your computer and iPhone must be on the **same WiFi network**
- Disable any VPN on either device
- Check firewall settings (Windows Firewall may block port 3000)

### Step 4: Allow Firewall Access (Windows)

If connection fails, allow Node.js through Windows Firewall:

1. Open **Windows Defender Firewall**
2. Click **Allow an app through firewall**
3. Find **Node.js** and check both Private and Public
4. Or temporarily disable firewall for testing

### Step 5: Restart the App

```bash
# Stop the current expo server (Ctrl+C)
# Clear cache and restart
npx expo start --clear
```

### Step 6: Test the Connection

1. Open the app on your iPhone
2. Try to login with a phone number
3. Shake your phone to open Network Logger
4. Check if the request shows:
   - ✅ Full URL: `http://192.168.1.105:3000/api/v1/auth/send-otp`
   - ✅ Status: 200 (success) or error details

## Troubleshooting

### Connection Refused / Network Error

**Check 1: Backend is running**
```bash
cd d:\pg-mobile-app\api
npm run start:dev
```
Should show: `Application is running on: http://localhost:3000`

**Check 2: Test from computer's browser**
Open: `http://localhost:3000/api/v1/health`
Should return JSON response

**Check 3: Test from phone's browser**
Open Safari on iPhone: `http://192.168.1.105:3000/api/v1/health`
(Replace with your IP)
Should return JSON response

**Check 4: Firewall blocking**
```bash
# Windows - Allow port 3000
netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
```

### Still Not Working?

1. **Check IP address is correct**
   - Run `ipconfig` again
   - Make sure you're using IPv4 (not IPv6)

2. **Try different port**
   - Change backend to port 8080 or 5000
   - Update frontend config accordingly

3. **Use ngrok** (Alternative solution)
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Expose your local server
   ngrok http 3000
   
   # Use the ngrok URL in your .env
   API_BASE_URL=https://abc123.ngrok.io/api/v1
   ```

## Example Working Setup

**Computer IP:** `192.168.1.105`

**Backend running at:** `http://localhost:3000`

**Frontend `.env` file:**
```
API_BASE_URL=http://192.168.1.105:3000/api/v1
```

**Test in Postman:**
```
POST http://192.168.1.105:3000/api/v1/auth/send-otp
Body: { "phone": "9876543210" }
```

**Test in iPhone Safari:**
```
http://192.168.1.105:3000/api/v1/health
```

**Test in App:**
1. Login with phone number
2. Shake phone
3. See network log with full URL and response

---

## Quick Reference

| Environment | URL |
|------------|-----|
| Postman (Computer) | `http://localhost:3000/api/v1` |
| Browser (Computer) | `http://localhost:3000/api/v1` |
| iPhone App | `http://192.168.1.XXX:3000/api/v1` |
| Web Browser (iPhone) | `http://192.168.1.XXX:3000/api/v1` |

Replace `192.168.1.XXX` with your actual computer IP address!
