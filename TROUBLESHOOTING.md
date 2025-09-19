# Admin Dashboard - Troubleshooting Guide

## Installation Issues

### 1. Package Not Found Errors

**Error**: `npm error 404 Not Found - GET https://registry.npmjs.org/@radix-ui%2freact-badge`

**Solution**:

- The `@radix-ui/react-badge` package doesn't exist
- This has been removed from package.json
- Run: `npm cache clean --force` then `npm install`

### 2. Node Version Issues

**Error**: `This version of Node.js is not supported`

**Solution**:

- Ensure you're using Node.js 18 or higher
- Check version: `node --version`
- Update Node.js if needed

### 3. Permission Issues (Windows)

**Error**: `EACCES: permission denied`

**Solution**:

- Run Command Prompt as Administrator
- Or use: `npm install --global --production windows-build-tools`

### 4. Network/Proxy Issues

**Error**: `ETIMEDOUT` or `ECONNREFUSED`

**Solution**:

- Check your internet connection
- If behind corporate firewall, configure npm proxy:
  ```bash
  npm config set proxy http://proxy.company.com:8080
  npm config set https-proxy http://proxy.company.com:8080
  ```

## Runtime Issues

### 1. Backend Connection Failed

**Error**: `Failed to fetch admission enquiries`

**Solution**:

- Ensure backend is running on `http://localhost:3000`
- Check if API endpoints are accessible: `curl http://localhost:3000/api/health`
- Verify `API_BASE_URL` in `.env.local`

### 2. Authentication Issues

**Error**: `Login failed` or `Invalid credentials`

**Solution**:

- Check default credentials: `admin@goalinstitute.com` / `admin123`
- Verify `JWT_SECRET` in environment variables
- Clear browser cookies and try again

### 3. Port Already in Use

**Error**: `Port 3001 is already in use`

**Solution**:

- Kill process using port 3001: `npx kill-port 3001`
- Or change port in `package.json`: `"dev": "next dev -p 3002"`

### 4. Build Errors

**Error**: `Module not found` or TypeScript errors

**Solution**:

- Delete `node_modules` and `package-lock.json`
- Run: `npm install` again
- Check for missing dependencies

## Quick Fixes

### Clean Installation

```bash
# Windows
cd admin-dashboard
rmdir /s node_modules
del package-lock.json
npm install

# Linux/Mac
cd admin-dashboard
rm -rf node_modules package-lock.json
npm install
```

### Reset Environment

```bash
# Copy fresh environment file
cp env.example .env.local
# Edit .env.local with your settings
```

### Check Dependencies

```bash
# Verify all packages are installed
npm list --depth=0

# Check for outdated packages
npm outdated
```

## Common Solutions

### 1. Force Install

```bash
npm install --force
```

### 2. Use Yarn Instead

```bash
# Install yarn
npm install -g yarn

# Install dependencies
yarn install
```

### 3. Clear All Caches

```bash
npm cache clean --force
npm install
```

### 4. Check Node Modules

```bash
# Verify critical packages
npm list next react react-dom
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at the error messages carefully
2. **Verify environment**: Ensure all environment variables are set
3. **Test backend**: Make sure the backend API is working
4. **Check versions**: Ensure Node.js and npm versions are compatible
5. **Clean install**: Try a completely fresh installation

## Environment Variables Checklist

Make sure these are set in `.env.local`:

```env
API_BASE_URL=http://localhost:3000/api
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001
ADMIN_EMAIL=admin@goalinstitute.com
ADMIN_PASSWORD=admin123
```

## Success Indicators

You'll know everything is working when:

1. ✅ `npm install` completes without errors
2. ✅ `npm run dev` starts successfully
3. ✅ Admin dashboard loads at `http://localhost:3001`
4. ✅ Login works with default credentials
5. ✅ Dashboard shows data from backend API
