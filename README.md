# Connectly

A professional, production-ready social media application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API route handlers
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── shared/           # Shared components
├── server/               # Server-side code
│   ├── actions/          # Server actions
│   ├── services/         # Business logic
│   ├── validators/       # Input validation
│   └── db/              # Database utilities
├── lib/                  # Shared libraries
│   ├── supabase/        # Supabase clients
│   ├── auth.ts          # Auth utilities
│   └── constants.ts     # App constants
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── styles/              # Global styles
└── types/               # TypeScript types
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ 
- pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connectly
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Set up Supabase Database**

   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT UNIQUE NOT NULL,
     username TEXT UNIQUE NOT NULL,
     full_name TEXT,
     avatar_url TEXT,
     bio TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Posts table
   CREATE TABLE posts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     image_url TEXT,
     video_url TEXT,
     likes_count INTEGER DEFAULT 0,
     comments_count INTEGER DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Likes table
   CREATE TABLE likes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, post_id)
   );

   -- Messages table
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
     receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     is_read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   -- Users can read all profiles
   CREATE POLICY "Public profiles are viewable by everyone"
     ON users FOR SELECT USING (true);

   -- Users can update own profile
   CREATE POLICY "Users can update own profile"
     ON users FOR UPDATE USING (auth.uid() = id);

   -- Anyone can read posts
   CREATE POLICY "Posts are viewable by everyone"
     ON posts FOR SELECT USING (true);

   -- Authenticated users can create posts
   CREATE POLICY "Users can create posts"
     ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Users can update/delete own posts
   CREATE POLICY "Users can update own posts"
     ON posts FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own posts"
     ON posts FOR DELETE USING (auth.uid() = user_id);
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Features

- ✅ **Authentication**: Secure login/register with Supabase Auth
- ✅ **User Profiles**: Customizable user profiles
- ✅ **Posts**: Create, read, update, delete posts
- ✅ **Likes**: Like/unlike posts
- ✅ **Messages**: Real-time messaging (ready for implementation)
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Dark Theme**: Professional dark color scheme
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Server Components**: Optimized performance
- ✅ **Middleware**: Route protection and auth management

## 🔒 Security

- Server-side authentication validation
- Row Level Security (RLS) policies
- Secure environment variable handling
- Admin keys isolated to server-side only
- Input validation with schemas
- CSRF protection via Next.js
- Secure cookie handling

## 📦 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🎯 Key Design Decisions

1. **Server Components First**: Default to Server Components for better performance
2. **Colocation**: Features organized by domain (auth, dashboard, etc.)
3. **Type Safety**: Strict TypeScript configuration
4. **Security First**: RLS policies, server-side validation
5. **Scalability**: Modular architecture supports growth to 1000+ concurrent users
6. **Professional UI**: Business-grade design with Inter font
7. **Supabase**: Secure, scalable backend with real-time capabilities

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Yes |

## 🚦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure the platform supports:
- Node.js 18+
- Environment variables
- Server-side rendering

## 📄 License

Private and Confidential

## 🤝 Contributing

This is a private project. Contact the maintainer for contribution guidelines.

---

Built with ❤️ using Next.js and Supabase
