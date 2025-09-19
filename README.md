# Goal Institute Admin Dashboard

A comprehensive admin dashboard for managing all form data from the Goal Institute website.

## Features

- 🔐 **Secure Authentication** - JWT-based admin authentication
- 📊 **Form Data Management** - View, manage, and export all form submissions
- 📈 **Analytics & Reports** - Comprehensive statistics and insights
- 🔍 **Advanced Filtering** - Search and filter forms by multiple criteria
- 📤 **Data Export** - Export data to CSV, Excel, and PDF formats
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Live data updates and status management

## Form Types Managed

1. **Admission Enquiries** - Prospective student inquiries
2. **Contact Forms** - General contact and support requests
3. **GAET Forms** - Goal Admission Entrance Test registrations
4. **GVET Forms** - Goal Village Entrance Test registrations

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: JWT tokens with HTTP-only cookies
- **API**: Axios for HTTP requests
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to the Goal Institute backend API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
# API Configuration
API_BASE_URL=http://localhost:3000/api

# Admin Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001

# Admin Settings
ADMIN_EMAIL=admin@goalinstitute.com
ADMIN_PASSWORD=your-admin-password
```

5. Start the development server:
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

### Default Login Credentials

- **Email**: admin@goalinstitute.com
- **Password**: admin123

## Project Structure

```
admin-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Authentication pages
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   └── providers/          # Context providers
│   ├── lib/                    # Utility functions and configurations
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
└── package.json
```

## API Integration

The admin dashboard integrates with the Goal Institute backend API to:

- Fetch form submissions
- Update form statuses
- Delete form entries
- Generate analytics and reports
- Export data

### API Endpoints Used

- `GET /api/admission/enquiries` - Fetch admission enquiries
- `PATCH /api/admission/enquiries/:id/status` - Update enquiry status
- `DELETE /api/admission/enquiries/:id` - Delete enquiry
- `GET /api/contact/forms` - Fetch contact forms
- `GET /api/gaet/forms` - Fetch GAET forms
- `GET /api/gvet/forms` - Fetch GVET forms

## Features Overview

### Dashboard
- Overview statistics
- Recent activity feed
- Quick action buttons
- Form type distribution

### Form Management
- View all form submissions
- Filter by status, course, date
- Search by name, email, phone
- Update form statuses
- Delete form entries
- Export data

### Analytics
- Form submission trends
- Status distribution
- Course popularity
- Geographic distribution
- Time-based analysis

### Export Functionality
- CSV export
- Excel export
- PDF reports
- Custom date ranges
- Filtered exports

## Security

- JWT-based authentication
- HTTP-only cookies
- Role-based access control
- Input validation and sanitization
- CORS protection
- Rate limiting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling
- Component-based architecture

## Deployment

### Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

### Environment Variables

Ensure the following environment variables are set in production:

- `API_BASE_URL` - Backend API URL
- `NEXTAUTH_SECRET` - JWT secret key
- `NEXTAUTH_URL` - Admin dashboard URL
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password

## Support

For support and questions, please contact the development team or create an issue in the repository.

## License

This project is proprietary software owned by Goal Institute.
