
---

# 🧩 Auth Core Test Server

This repository is a **Node.js API server** used to **test the [`@flycatch/auth-core`](https://github.com/flycatch/auth-core)** module in both development and production environments.

---

## 🚀 Overview

The **Auth Core Test Server** provides an Express-based test environment to validate authentication flows (JWT, session, OAuth2) powered by the `@flycatch/auth-core` module.

**Main Repository:**
👉 [`authcore-test-server`](https://github.com/bprahul017/authcore-test-server.git)

**Auth Core Module Repository:**
👉 [`@flycatch/auth-core`](https://github.com/flycatch/auth-core)

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/bprahul017/authcore-test-server.git
cd authcore-test-server
```

### 2. Checkout the main branch

```bash
git checkout main
```

### 3. Install dependencies

```bash
npm install
```

### 4. Install the `@flycatch/auth-core` module

```bash
npm i @flycatch/auth-core
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Base URLs
BASE_URL=http://localhost:4000

# Secrets
SESSION_SECRET=session-secret-change-in-production
JWT_SECRET=jwt-secret-change-in-production
```

---

## 💻 Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

---

## 🧪 Local Development with `@flycatch/auth-core`

If you want to **test changes in the auth-core module** locally:

### 1. Clone both repositories

```bash
# Clone the auth-core module
git clone https://github.com/flycatch/auth-core.git
cd auth-core
git checkout <branch-you-want-to-test>
npm install
npm link
```

### 2. Link the module in the test server

```bash
cd ../authcore-test-server
git checkout <same-branch-as-auth-core>
npm link @flycatch/auth-core
```

### 3. Add `.env` (same as production setup)

Ensure all OAuth and secret environment variables are set.

### 4. Run the test server

```bash
npm run dev
# or
npm start
```

---

## 📬 API Endpoints (Postman Collection)

You can find the ready-to-use Postman collection here:
👉 [Auth Core Test Server – Postman Collection](https://postman.co/workspace/My-Workspace~8acf908e-294b-4819-88a3-c1512269bd4a/collection/42709189-f9d38b95-9327-48f6-873c-9dbd6aaec4c9?action=share&creator=42709189&active-environment=42709189-85f911fe-c89c-40e7-8cf6-bc50660163f7)

Import this collection in Postman to quickly test OAuth flows and endpoints.

---

## 🧰 Tech Stack

* **Node.js** (v22+)
* **Express.js**
* **TypeScript**
* **@flycatch/auth-core**
* **Nodemon** (for hot reload in dev)

---

## 🧑‍💻 Author

**Rahul B P**
[GitHub Profile](https://github.com/bprahul017)

---
