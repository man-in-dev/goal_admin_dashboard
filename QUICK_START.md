# Admin Dashboard - Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd admin-dashboard
npm install
```

### 2. Create Environment File

```bash
cp env.example .env.local
```

### 3. Configure Environment Variables

Edit `.env.local`:

```env
API_BASE_URL=http://localhost:3000/api
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001
ADMIN_EMAIL=admin@goalinstitute.com
ADMIN_PASSWORD=admin123
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Access the Dashboard

- Open: `http://localhost:3001`
- Login: `admin@goalinstitute.com` / `admin123`

## 🔧 Troubleshooting

### If you get package errors:

```bash
npm cache clean --force
npm install
```

### If styling looks broken:

1. Check if Tailwind CSS is working: Visit `/test` page
2. Verify all UI components are imported correctly
3. Check browser console for errors

### If backend connection fails:

1. Ensure backend is running on `http://localhost:3000`
2. Check `API_BASE_URL` in `.env.local`
3. Test API endpoint: `curl http://localhost:3000/api/health`

## 📁 File Structure

```
admin-dashboard/
├── src/
│   ├── app/                    # Pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Login page
│   │   └── test/               # Test page
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   └── dashboard/          # Dashboard components
│   └── lib/                    # Utilities
├── package.json
└── .env.local                  # Environment variables
```

## 🎯 Key Features

- ✅ Responsive design
- ✅ Form data management
- ✅ Real-time statistics
- ✅ Export functionality
- ✅ Secure authentication
- ✅ Modern UI components

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure backend API is accessible
4. Try a clean installation (delete node_modules and reinstall)
