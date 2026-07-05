# ♾️ InfinityDrive

InfinityDrive is a revolutionary, unlimited storage solution built on top of Google Drive. By seamlessly linking multiple Google accounts together under one unified dashboard, InfinityDrive allows you to aggregate your cloud storage without paying for premium subscriptions. 

Stop managing multiple accounts. Start experiencing infinite storage.

## ✨ Features

- **Unified Dashboard**: View, manage, and search all your files across your primary and linked Google accounts in one beautiful, single-pane-of-glass interface.
- **Cross-Account Merging**: The "All Files" view concurrently fetches and aggregates files across all your connected accounts, perfectly sorted and badged.
- **Seamless Transfers**: Move files between your Google accounts instantly with a single click. Offload large files from your primary account to a secondary account to free up space.
- **Smart Quota Management**: Real-time visualization of your storage limits and usage across all linked accounts.
- **Premium UI**: Built with a sleek, modern aesthetic using Tailwind CSS and Framer Motion. Features include a breathtaking scroll-tilted grid landing page, interactive 3D folder galleries, and glassmorphic design elements.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 & Framer Motion
- **Authentication**: NextAuth.js (v5 Beta)
- **Database**: Firebase / Firestore
- **API Integration**: Google Drive API (`googleapis`)
- **State Management**: SWR (Stale-While-Revalidate)

## 🛠️ Getting Started

### Prerequisites

1. A Firebase project with Firestore enabled.
2. A Google Cloud project with the **Google Drive API** enabled and OAuth credentials configured.

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Firebase Admin
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"

# Encryption (32-byte hex string)
ENCRYPTION_KEY="your-32-byte-encryption-key"
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Security

- **Client-Side Safety**: Access tokens and refresh tokens are managed entirely server-side.
- **Encrypted Storage**: Secondary account refresh tokens are strictly encrypted using AES-256-GCM before being stored in Firestore.
- **Token Auto-Refresh**: Tokens are automatically refreshed in the background upon expiration, ensuring uninterrupted access without manual re-authentication.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
