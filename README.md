# SkillLink - AI-Powered Campus Skill Swap Platform

![SkillLink Banner](https://img.shields.io/badge/SkillLink-AI%20Powered-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> A revolutionary peer-to-peer learning platform that connects students for knowledge exchange through AI-powered matching, gamification, and a skill coins economy.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Features
- **AI-Powered Matching**: Smart algorithm matches learners with teachers based on Skill DNA, preferences, and compatibility
- **Skill Coins Economy**: Earn by teaching, spend by learning - self-sustaining ecosystem
- **Gamification**: Badges, streaks, leaderboards, and achievements to boost engagement
- **Real-time Chat**: Instant messaging between users
- **Video Sessions**: Integrated video calling for remote learning
- **Session Management**: Book, track, and review learning sessions
- **Profile & Portfolio**: Showcase skills, badges, and certificates

### Advanced Features
- **Skill DNA Profiling**: AI-generated personality and skill assessment
- **Smart Filters**: Multi-dimensional filtering (gender, branch, year, mode, availability, language)
- **Verified Teachers**: Campus-verified badges for trusted mentors
- **Marketplace**: Buy/sell courses, notes, PDFs, and tutorials
- **Skill Reels**: Short video showcases (15-30 sec)
- **Community Rooms**: Public skill-based learning communities
- **Digital Portfolio**: Auto-generated shareable portfolio
- **Streak Tracking**: Daily learning/teaching streak rewards

### Premium Features
- **Free Tier**: 5 learning sessions/month, 10 teaching sessions/month
- **Pro Tier** ($9.99/mo): Unlimited sessions, priority matching, analytics, video recording
- **Enterprise**: Campus-wide licensing with admin dashboard and custom branding

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for blazing-fast builds
- **Lucide React** for icons
- **Supabase Client** for backend integration

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime + Edge Functions)
- **Deno Runtime** for serverless functions
- **Row Level Security** for data protection
- **Database Functions & Triggers** for automation

### AI/ML
- Custom matching algorithm
- Skill DNA generation
- Compatibility scoring
- Recommendation engine

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works!)
- Git

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/skilllink.git
cd skilllink

# Install dependencies
npm install
```

---

## Environment Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (2-3 minutes)
3. Go to Settings > API to get your credentials

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Database Setup

### 1. Run Migrations

Go to Supabase Dashboard > SQL Editor and run the following migrations in order:

#### Migration 1: Core Schema
Copy and paste the contents from the Supabase migrations that were already applied.

The migrations create:
- 17 core tables (profiles, skills, sessions, transactions, etc.)
- Row Level Security policies
- Database indexes for performance
- Sample data (skills, badges)

### 2. Deploy Edge Functions

Edge functions are already deployed:
- `ai-skill-matcher`: AI matching algorithm
- `session-manager`: Session lifecycle management
- `skill-dna-generator`: Skill DNA profile generation

### 3. Verify Setup

Check that all tables are created:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 17 tables including profiles, skills, sessions, etc.

---

## Running Locally

### Development Mode

```bash
# Start the dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Type Checking

```bash
# Run TypeScript type check
npm run typecheck
```

### Linting

```bash
# Run ESLint
npm run lint
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Add environment variables in Vercel dashboard

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to Traditional Hosting

1. Build the project:
```bash
npm run build
```

2. Upload the `dist/` folder to your hosting provider

---

## Project Structure

```
skilllink/
├── public/               # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── AuthModal.tsx
│   │   └── Navbar.tsx
│   ├── views/           # Page views
│   │   ├── HomeView.tsx
│   │   ├── FindTeachersView.tsx
│   │   ├── MySkillsView.tsx
│   │   └── ProfileView.tsx
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/            # Utilities and configs
│   │   └── supabase.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── supabase/           # Supabase functions (deployed)
│   └── functions/
│       ├── ai-skill-matcher/
│       ├── session-manager/
│       └── skill-dna-generator/
├── .env.example        # Environment template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── tailwind.config.js  # Tailwind config
├── vite.config.ts      # Vite config
├── README.md           # This file
└── SKILLLINK_DOCUMENTATION.md  # Complete documentation
```

---

## API Documentation

### Authentication

All API requests require authentication via Supabase Auth:

```typescript
import { supabase } from './lib/supabase';

// Sign up
await supabase.auth.signUp({ email, password });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();
```

### Edge Functions

#### AI Skill Matcher

```typescript
const apiUrl = `${SUPABASE_URL}/functions/v1/ai-skill-matcher`;

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    learner_id: userId,
    skill_id: skillId,
    filters: {
      gender: 'any',
      min_rating: 4.0,
      max_coin_rate: 50,
    }
  }),
});

const { matches } = await response.json();
```

#### Session Manager

```typescript
// Create session
const apiUrl = `${SUPABASE_URL}/functions/v1/session-manager?action=create`;

await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    teacher_id: teacherId,
    learner_id: learnerId,
    skill_id: skillId,
    session_type: 'video',
    scheduled_start: startTime,
    scheduled_end: endTime,
    coin_amount: 30,
  }),
});
```

### Database Queries

```typescript
// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Get teaching skills
const { data: skills } = await supabase
  .from('user_skills_teaching')
  .select(`
    *,
    skills (*)
  `)
  .eq('user_id', userId);

// Get sessions
const { data: sessions } = await supabase
  .from('sessions')
  .select(`
    *,
    teacher:teacher_id (full_name, avatar_url),
    learner:learner_id (full_name, avatar_url),
    skill:skill_id (name, category)
  `)
  .eq('learner_id', userId)
  .order('scheduled_start', { ascending: false });
```

---

## User Guide

### Getting Started

1. **Sign Up**: Create an account with your email
2. **Complete Profile**: Add your campus, branch, year, and bio
3. **Add Skills**: List skills you can teach and want to learn
4. **Take DNA Quiz**: Complete the Skill DNA questionnaire
5. **Find Teachers**: Search for teachers using AI matching
6. **Book Session**: Schedule a learning session
7. **Complete & Review**: Attend the session and leave a review
8. **Earn Coins**: Get paid in skill coins for teaching

### How to Teach

1. Go to "My Skills" tab
2. Click "Add Teaching Skill"
3. Select skill, set proficiency level and hourly rate
4. Set your availability and teaching mode
5. Wait for session requests
6. Accept requests and start teaching
7. Earn skill coins after each session

### How to Learn

1. Go to "Find Teachers"
2. Select a skill you want to learn
3. Apply filters (optional)
4. Click "Find Teachers" to get AI matches
5. Review matches sorted by compatibility
6. Click "Book Session" on your preferred teacher
7. Complete payment in skill coins
8. Attend the session and learn
9. Leave a review after completion

### Earning Skill Coins

- **Initial Bonus**: 100 coins for new users
- **Teaching**: Set your own hourly rate (10-100 coins)
- **Referrals**: 50 coins per successful referral
- **Daily Streaks**: Bonus coins for maintaining streaks
- **Achievements**: Coins for completing milestones
- **Marketplace**: Sell content for coins

### Spending Skill Coins

- **Learning Sessions**: Pay teachers their hourly rate
- **Marketplace**: Buy courses, notes, tutorials
- **Premium Features**: Upgrade using coins (100 coins = $1)
- **Boost Profile**: Pay to appear higher in search results

---

## FAQ

### Q: Is SkillLink free?
A: Yes! The free tier includes 5 learning sessions and 10 teaching sessions per month. Pro tier ($9.99/mo) offers unlimited sessions.

### Q: How does the AI matching work?
A: Our AI analyzes your Skill DNA, preferences, availability, and compatibility factors to find the best teachers for you, scoring each match 0-100.

### Q: What is Skill DNA?
A: A unique profile generated by AI that represents your technical aptitude, creativity, analytical skills, communication, and leadership based on your activity and questionnaire responses.

### Q: How do I earn skill coins?
A: Teach skills and set your own hourly rate. You'll earn coins after each completed session. You can also earn through referrals, streaks, and selling content.

### Q: Can I teach and learn simultaneously?
A: Absolutely! You can be both a teacher and learner. In fact, we encourage it for a balanced learning experience.

### Q: Are video sessions recorded?
A: Pro users can enable session recording. Free users get 7-day chat history only.

### Q: How do I get verified?
A: Complete your campus verification by uploading your student ID. Campus administrators will review and approve within 24-48 hours.

### Q: Can I use SkillLink on mobile?
A: Yes! The web app is fully mobile-responsive. Native mobile apps (iOS/Android) are coming in Phase 6 of our roadmap.

---

## Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

Open an issue with:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/device information

### Suggesting Features

Open an issue with:
- Feature description
- Use case and benefits
- Mockups or wireframes (optional)

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write TypeScript, not JavaScript
- Add types for all function parameters
- Use Tailwind CSS for styling
- Test your changes thoroughly
- Update documentation if needed

---

## Roadmap

### Phase 1: MVP ✅ (Completed)
- Database schema and authentication
- Basic profile management
- Skill listing and AI matching
- Session booking and coins economy

### Phase 2: Gamification 🚧 (In Progress)
- Badge system
- Streak tracking
- Leaderboards
- Certificates

### Phase 3: AI Enhancement 📅 (Planned)
- Advanced Skill DNA
- Recommendation engine
- Career path suggestions
- Learning analytics

### Phase 4: Marketplace 📅 (Planned)
- Content marketplace
- Payment integration
- Premium tiers
- Subscription management

### Phase 5: Video & Real-time 📅 (Planned)
- Video calling
- Screen sharing
- Community rooms
- Skill reels

### Phase 6: Scale & Mobile 📅 (Planned)
- Mobile apps
- Campus SSO
- Admin dashboard
- API for partners

---

## Support

### Documentation
- [Complete Documentation](./SKILLLINK_DOCUMENTATION.md) - Full technical and business documentation
- [API Reference](#api-documentation) - API endpoints and examples
- [User Guide](#user-guide) - How to use SkillLink

### Community
- Discord: [Join our community](#) (Coming soon)
- Email: support@skilllink.education
- Twitter: [@SkillLinkEdu](#) (Coming soon)

### Commercial Support
For enterprise support, custom integrations, or campus partnerships:
- Email: enterprise@skilllink.education
- Phone: +1 (XXX) XXX-XXXX

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Supabase team for the amazing backend platform
- React and Vite communities for excellent tools
- All open-source contributors
- Beta testers and early adopters
- Campus partners and ambassadors

---

## Team

**Founders**: [Your Name] - [Role]

**Advisors**: [Advisor Names]

**Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## Contact

**SkillLink**
- Website: www.skilllink.education (Coming soon)
- Email: team@skilllink.education
- GitHub: github.com/skilllink
- LinkedIn: linkedin.com/company/skilllink

---

**Built with ❤️ by students, for students**

*Empowering the next generation through peer learning*
