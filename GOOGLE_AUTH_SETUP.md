# Google Authentication Setup Guide

This project uses NextAuth.js with Google OAuth for authentication. Follow these steps to set up Google authentication:

## 1. Google Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`

## 2. Environment Variables

1. Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Google OAuth credentials in `.env.local`:

   ```bash
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. Generate a secret for NEXTAUTH_SECRET:

   ```bash
   openssl rand -base64 32
   ```

## 3. Features Included

- **Sign In Page**: Custom sign-in page with Google OAuth
- **Authentication Header**: Shows user info and sign-out option
- **Session Management**: Persistent sessions across page reloads
- **Protected Routes**: Hook to protect pages that require authentication
- **Error Handling**: Custom error page for authentication failures

## 4. Usage in Components

### Check Authentication Status

```tsx
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') return <p>Not signed in</p>

  return <p>Signed in as {session.user.email}</p>
}
```

### Require Authentication

```tsx
import { useRequireAuth } from '@/hooks/useAuth'

function ProtectedPage() {
  const { session, isLoading } = useRequireAuth()

  if (isLoading) return <div>Loading...</div>

  return <div>Protected content for {session.user.name}</div>
}
```

### Sign In/Out

```tsx
import { signIn, signOut } from 'next-auth/react'

// Sign in
<button onClick={() => signIn('google')}>Sign in with Google</button>

// Sign out
<button onClick={() => signOut()}>Sign out</button>
```

## 5. API Routes

- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/session` - Get current session
- `/api/auth/callback/google` - Google OAuth callback

## 6. Custom Pages

- `/auth/signin` - Custom sign-in page with Material-UI styling
- `/auth/error` - Custom error page for authentication failures

## 7. Security Notes

- Always use HTTPS in production
- Keep your client secret secure
- Regularly rotate your NEXTAUTH_SECRET
- Set appropriate redirect URIs in Google Console
- Consider implementing CSRF protection for sensitive operations

## 8. Vercel Deployment Setup

### Step 1: Update Google Console for Production

1. Go to your [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add your Vercel production URL to authorized redirect URIs:

   ```text
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

5. If using a custom domain, also add:

   ```text
   https://yourdomain.com/api/auth/callback/google
   ```

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add the following variables:

   ```bash
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-production-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

   **Important Notes:**
   - Use the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from your Google Console
   - Generate a new `NEXTAUTH_SECRET` for production: `openssl rand -base64 32`
   - Set `NEXTAUTH_URL` to your actual Vercel domain

### Step 2.1: Secret Rotation Strategy

For enhanced security, implement regular secret rotation:

#### **Automated Secret Rotation with Vercel CLI**

1. Create a rotation script (`scripts/rotate-secret.sh`):

   ```bash
   #!/bin/bash

   # Generate new secret
   NEW_SECRET=$(openssl rand -base64 32)

   # Update Vercel environment variable
   vercel env rm NEXTAUTH_SECRET production --yes
   echo "$NEW_SECRET" | vercel env add NEXTAUTH_SECRET production

   # Trigger redeployment
   vercel --prod

   echo "Secret rotated successfully"
   echo "New secret: $NEW_SECRET"
   echo "Please store this securely!"
   ```

2. Make script executable:

   ```bash
   chmod +x scripts/rotate-secret.sh
   ```

3. Run rotation:

   ```bash
   ./scripts/rotate-secret.sh
   ```

#### **Manual Secret Rotation**

1. Generate a new secret:

   ```bash
   openssl rand -base64 32
   ```

2. Update in Vercel Dashboard:
   - Go to Settings > Environment Variables
   - Edit `NEXTAUTH_SECRET`
   - Paste the new value
   - Redeploy the application

#### **Scheduled Rotation (Recommended)**

For production applications, consider:

- **Monthly rotation**: Set calendar reminders
- **CI/CD integration**: Automate during deployment
- **Emergency rotation**: Have process ready for security incidents

#### **Session Impact**

⚠️ **Important**: Rotating `NEXTAUTH_SECRET` will:

- Invalidate all existing user sessions
- Force all users to sign in again
- Clear all JWT tokens

**Best Practices:**

- Rotate during low-traffic periods
- Notify users if appropriate
- Monitor for authentication errors post-rotation

### Step 3: Deploy to Vercel

#### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy from your project root:

   ```bash
   vercel --prod
   ```

#### Option B: Deploy via Git Integration

1. Connect your GitHub repository to Vercel
2. Push your code to the main branch
3. Vercel will automatically deploy on each push
4. Environment variables will be used from your Vercel dashboard settings

### Step 4: Verify Deployment

1. Visit your deployed app: `https://your-app-name.vercel.app`
2. Test the sign-in flow:
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify you're redirected back to your app
   - Check that user session persists

### Step 5: Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" > "Domains"
2. Add your custom domain
3. Update your Google Console redirect URIs to include the custom domain
4. Update `NEXTAUTH_URL` environment variable in Vercel to use the custom domain

## 9. Troubleshooting

### Common Issues

1. **Invalid redirect URI**: Make sure your redirect URI in Google Console matches exactly
2. **Client ID not found**: Check that your environment variables are correctly set
3. **Session not persisting**: Ensure NEXTAUTH_SECRET is set and consistent
4. **CORS errors**: Verify your domain is correctly configured in Google Console

### Production-Specific Issues

1. **Authentication fails in production**:
   - Verify `NEXTAUTH_URL` matches your actual domain
   - Check that redirect URIs in Google Console include your production URL
   - Ensure all environment variables are set in Vercel

2. **Session cookies not working**:
   - Make sure you're using HTTPS in production
   - Verify `NEXTAUTH_SECRET` is properly set and different from development

3. **Google OAuth errors**:
   - Confirm your Google Console project is verified for production use
   - Check that your OAuth consent screen is configured for external users
   - Verify authorized domains include your production domain

### Debug Mode

Add to your `.env.local` for detailed logs:

```bash
NEXTAUTH_DEBUG=true
```

**Note**: Only enable debug mode in development, never in production.
