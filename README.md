# Safegal - FGM Risk Alert System

A privacy-first web application for reporting and responding to female genital mutilation risks in Kenya. Built with React, TypeScript, Supabase, and Tailwind CSS.

## 🛡️ Mission

Keep girls safe, quietly. Flag risk in under a minute. Officers act. Communities see response times—not names.

## 🚀 Features

### Core Functionality
- **Anonymous Reporting**: Teachers and guardians can report FGM risks without storing personal information
- **Automatic Redaction**: Names, phone numbers, and PII are automatically removed from reports
- **Role-Based Access**: Different interfaces for reporters, officers, and administrators
- **Real-Time Dashboard**: County-level statistics and performance metrics
- **Audit Trail**: Tamper-evident hash chain for all actions
- **Rate Limiting**: Prevents spam and abuse with intelligent limits

### Privacy & Security
- **No Personal Data**: Names and phone numbers are never stored
- **Automatic Redaction**: PII is removed before storage
- **Role-Based Permissions**: Users only see data relevant to their role
- **Audit Logging**: Every action is cryptographically logged
- **Row Level Security**: Database-level access control

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Shadcn/ui** for UI components

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Edge Functions** for server-side logic
- **Real-time subscriptions** for live updates

### Database Schema
- **profiles**: User accounts and roles
- **cases**: FGM risk reports
- **case_notes**: Action history and notes
- **audit_log**: Tamper-evident audit trail
- **counties**: Geographic data
- **schools**: Educational institutions
- **user_rate_limits**: Rate limiting data

## 👥 User Roles

### Reporters
- **Teachers**: School staff who report student risks
- **Guardians**: Parents or guardians reporting concerns
- **Permissions**: Create reports, view own school's cases (redacted)

### Responders
- **CPO (Child Protection Officers)**: County-level child protection staff
- **NGO Officers**: Non-governmental organization staff
- **Permissions**: View and manage cases in their county, perform actions

### Administrators
- **System Admins**: Full system access and user management
- **Permissions**: Approve officers, manage users, configure system

## 🛣️ Routes & Pages

### Public Pages
- `/` - Home page with overview and navigation
- `/public` - County performance scoreboard
- `/trust` - Trust seal and audit trail verification
- `/learn` - Educational resources and help information

### Authentication
- `/auth` - Login with magic link/OTP
- `/onboarding/role` - Role selection for new users

### Protected Pages
- `/report` - File FGM risk alerts (reporters)
- `/officer` - Case management dashboard (officers)
- `/admin` - System administration (admins)

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safegal-guardian-alert
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Copy your Supabase URL and anon key

4. **Environment variables**
   Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Database Setup

1. **Run migrations**
   ```bash
   npx supabase db push
   ```

2. **Seed data** (optional)
   ```bash
   npx supabase db reset
   ```

## 📱 Mobile App (Capacitor)

### Building for Android

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init
   ```

2. **Build the web app**
   ```bash
   npm run build
   ```

3. **Add Android platform**
   ```bash
   npx cap add android
   npx cap sync
   ```

4. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

5. **Build APK**
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Or command line: `./gradlew assembleDebug`

### Configuration
- Update `android/app/src/main/AndroidManifest.xml` for permissions
- Configure app icons in `android/app/src/main/res/`
- Set app name in `android/app/src/main/res/values/strings.xml`

## 🔐 Security Features

### Privacy Protection
- **Automatic Redaction**: Names, phones, emails, addresses removed
- **No PII Storage**: Personal data never stored in database
- **Anonymous Reporting**: Reporters remain anonymous to officers

### Access Control
- **Row Level Security**: Database-level permission enforcement
- **Role-Based Access**: Different data visibility per role
- **County Isolation**: Officers only see their county's cases

### Audit & Transparency
- **Hash Chaining**: Cryptographic audit trail
- **Tamper Detection**: Any modification breaks the chain
- **Public Verification**: Trust seal for community verification

## 📊 Rate Limiting

### Limits
- **3 reports per 24 hours** per user
- **10 minutes minimum** between reports
- **Soft block** after 5 unfounded reports in 30 days

### Implementation
- Database-backed rate limiting
- Real-time enforcement
- Clear user feedback

## 🤖 AI & Automation

### Risk Scoring
- **Local Algorithm**: No external AI calls
- **Deterministic**: Same inputs always produce same score
- **Transparent**: Scoring factors are visible and explainable

### Spike Detection
- **Pattern Recognition**: Identifies unusual activity patterns
- **County-Level**: Monitors trends within geographic areas
- **Real-Time**: Automatic detection and alerting

### Note: No External AI
This system uses local, rule-based algorithms for risk assessment and pattern detection. No personal data is sent to external AI services. All processing happens locally or on our secure servers.

## 🧪 Testing

### Manual Testing Checklist

1. **Report Creation**
   - [ ] Create alert in under 30 seconds
   - [ ] Returns case code
   - [ ] No names/phones stored in database
   - [ ] Redaction works correctly

2. **Officer Workflow**
   - [ ] Login lands on `/officer`
   - [ ] Double-ack changes status to `acknowledged`
   - [ ] Actions are logged in audit trail

3. **Public Pages**
   - [ ] `/public` numbers change after actions
   - [ ] `/trust` seal changes after any action
   - [ ] No personal details shown

4. **Access Control**
   - [ ] Reporters cannot read other schools' cases
   - [ ] Officers cannot read other counties
   - [ ] Rate limit blocks 4th alert in 24 hours

5. **Offline Support**
   - [ ] `/report` works offline
   - [ ] Queued alert sends when online

### Unit Tests
```bash
npm run test
```

## 🚨 Emergency Information

### Emergency Contacts
- **Police**: 999 or 112
- **Childline Kenya**: 116
- **GBV Hotline**: 1195
- **National Emergency**: 1199

### Important Notice
Safegal does not replace emergency services. If someone is in immediate danger, call emergency services immediately.

## 📈 Performance

### Metrics
- **Report Creation**: < 30 seconds
- **Officer Response**: < 4 hours acknowledgment
- **First Action**: < 24 hours
- **System Uptime**: 99.9%

### Monitoring
- Real-time performance dashboards
- Error tracking and alerting
- Usage analytics (anonymized)

## 🔄 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
NODE_ENV=production
```

### Hosting
- **Vercel**: Recommended for React apps
- **Netlify**: Alternative hosting option
- **AWS S3 + CloudFront**: For custom domains

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use conventional commits
3. Write tests for new features
4. Update documentation
5. Follow privacy-first principles

### Code Style
- ESLint configuration included
- Prettier for formatting
- TypeScript strict mode enabled

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Security Guide](./docs/security.md)

### Contact
- **Technical Issues**: GitHub Issues
- **Security Concerns**: security@safegal.org
- **General Support**: support@safegal.org

---

**Remember**: This platform does not replace emergency services. If someone is in immediate danger, call 1199 or your local emergency services immediately.
