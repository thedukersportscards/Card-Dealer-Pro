# 🃏 Card Dealer Pro

Your personal sports card inventory tracker with AI-powered card identification.

---

## What This Does

- **Photo a card → AI identifies it** — player, year, set, parallel, card number
- Track cost basis, market value, target price, and floor price
- Auto-calculates your margin at target and floor
- Value confidence rating (Low / Medium / High)
- Status tracking (Inventory / At Grading / Sold)
- Stats dashboard — realized profit, potential profit, top cards
- Works on iPhone from your home screen like a native app

---

## Deployment Guide (Step by Step)

### Step 1 — Get a GitHub account
1. Go to **github.com** and create a free account
2. Once logged in, click the **+** button (top right) → **New repository**
3. Name it `card-dealer-pro`
4. Leave everything else as default
5. Click **Create repository**

### Step 2 — Upload the code
1. On your new repository page, click **uploading an existing file**
2. Drag ALL the files from this folder into the upload area
   - Make sure you include the `pages/` folder and `styles/` folder
3. Click **Commit changes**

### Step 3 — Get your Anthropic API key
1. Go to **console.anthropic.com**
2. Sign in (or create a free account)
3. Click **API Keys** in the left sidebar
4. Click **Create Key** — give it a name like "Dealer Pro"
5. **Copy the key** — it starts with `sk-ant-...`
6. Store it somewhere safe — you won't be able to see it again

### Step 4 — Deploy on Vercel
1. Go to **vercel.com** and click **Sign Up**
2. Choose **Continue with GitHub** — this connects your accounts
3. Click **Add New Project**
4. Find your `card-dealer-pro` repository and click **Import**
5. Before clicking Deploy, look for **Environment Variables**
6. Add one variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your API key from Step 3
7. Click **Deploy**
8. Wait about 60 seconds — Vercel builds and publishes your app
9. You'll get a URL like `card-dealer-pro.vercel.app` — that's your app!

### Step 5 — Add to iPhone home screen
1. Open the URL in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Name it "Dealer Pro" and tap **Add**
5. It now works like a native app from your home screen

---

## Updating the App

Whenever you want changes made:
1. Ask Claude to update the code
2. Download the updated file
3. Go to your GitHub repository
4. Click the file you want to replace → click the pencil icon to edit, or just re-upload
5. Vercel automatically redeploys within about 60 seconds

---

## Cost

- **GitHub:** Free
- **Vercel:** Free (more than enough for personal use)
- **Anthropic API:** Pay per use — identifying a card costs roughly $0.003 (less than half a cent)
  - 1,000 card identifications ≈ $3.00
  - At show prep volumes, expect a few dollars per year

---

## Your Data

Your inventory is stored in your browser's localStorage — it stays on your device.
If you want to back it up, use the browser console to export it, or ask Claude to add an export feature.

---

## Questions?

Bring any issues back to Claude — describe what's happening and Claude can update the code.
