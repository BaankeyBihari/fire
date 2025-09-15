# Secret Rotation Guide

This document provides comprehensive instructions for rotating the `NEXTAUTH_SECRET` and other sensitive credentials in your FIRE calculator application.

## Why Rotate Secrets?

Regular secret rotation is a security best practice that:

- ✅ Limits the impact of potential credential exposure
- ✅ Reduces the window of vulnerability
- ✅ Maintains compliance with security standards
- ✅ Provides fresh cryptographic material

## Available Rotation Methods

### 1. Manual Rotation via Vercel Dashboard

**When to use**: For immediate rotation or one-off updates

**Steps**:

1. Generate new secret: `openssl rand -base64 32`
2. Go to Vercel Dashboard > Project > Settings > Environment Variables
3. Edit `NEXTAUTH_SECRET` and replace with new value
4. Redeploy the application

### 2. Script-Based Rotation

**When to use**: For regular maintenance or when you prefer command-line tools

**Command**:

```bash
yarn rotate-secret
```

**What it does**:

- Generates a new 32-byte base64 secret
- Updates Vercel environment variable
- Triggers automatic redeployment
- Provides confirmation and logging

### 3. GitHub Actions Automation (Optional)

**When to use**: For scheduled rotation or team-managed deployments

**Features**:

- Manual trigger with confirmation
- Optional monthly automatic rotation
- Creates GitHub issues for audit trail
- Integrates with existing CI/CD

## Impact of Secret Rotation

⚠️ **Important**: When you rotate `NEXTAUTH_SECRET`:

### Immediate Effects

- All existing user sessions become invalid
- Users must sign in again
- JWT tokens are invalidated
- Session cookies become unusable

### User Experience

- Users see "not authenticated" state
- Sign-in flow remains functional
- No data loss occurs
- Previous authentication history preserved

## Best Practices

### Timing

- **Rotate during low-traffic periods** (e.g., early morning, weekends)
- **Avoid rotation during peak usage**
- **Consider user time zones** for global applications

### Communication

- **Notify team members** before rotation
- **Document rotation in change logs**
- **Monitor application** post-rotation

### Security

- **Store new secrets securely**
- **Use different secrets** for different environments
- **Never commit secrets** to version control
- **Generate truly random secrets**

## Rotation Schedule

### Recommended Frequency

| Secret Type              | Frequency | Method              |
| ------------------------ | --------- | ------------------- |
| NEXTAUTH_SECRET          | Monthly   | Automated or Script |
| Google OAuth Credentials | Quarterly | Manual              |
| Database Passwords       | Quarterly | Manual              |
| API Keys                 | As needed | Manual              |

### Emergency Rotation

In case of suspected compromise:

1. **Immediate**: Rotate `NEXTAUTH_SECRET` using manual method
2. **Within 1 hour**: Review and rotate Google OAuth credentials
3. **Within 24 hours**: Audit all other credentials
4. **Document incident** for future reference

## Monitoring After Rotation

### Check List

- [ ] Application loads successfully
- [ ] Sign-in flow works correctly
- [ ] User authentication functions properly
- [ ] No error logs related to authentication
- [ ] Performance metrics remain stable

### Common Issues

- **Authentication errors**: Check new secret is properly deployed
- **Session issues**: Clear browser data for testing
- **Deployment problems**: Verify Vercel environment variables

## Development Environment

For local development, generate a new secret:

```bash
yarn rotate-secret:dev
```

Update your `.env.local` file with the new secret.

## Automation Setup

### GitHub Actions Prerequisites

To enable automated rotation, add these secrets to your GitHub repository:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=your_project_id
VERCEL_ORG_ID=your_org_id
```

### Vercel Token Setup

1. Go to Vercel Dashboard > Settings > Tokens
2. Create new token with appropriate permissions
3. Add to GitHub repository secrets

## Security Checklist

Use this checklist for security maintenance:

```bash
yarn security:check
```

### Monthly Tasks

- [ ] Rotate NEXTAUTH_SECRET
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Check for security advisories

### Quarterly Tasks

- [ ] Rotate Google OAuth credentials
- [ ] Review API keys and tokens
- [ ] Audit user permissions
- [ ] Update security documentation

## Troubleshooting

### Rotation Script Fails

**Issue**: Script exits with error
**Solution**:

1. Check Vercel CLI is installed and authenticated
2. Verify project permissions
3. Ensure stable internet connection

### Users Can't Sign In After Rotation

**Issue**: Authentication flow broken
**Solution**:

1. Verify new secret is deployed
2. Check Google OAuth configuration
3. Clear browser cache/cookies
4. Test with incognito/private browsing

### Environment Variable Not Updated

**Issue**: Old secret still active
**Solution**:

1. Check Vercel dashboard shows new value
2. Trigger manual redeployment
3. Verify environment variable scope (production vs preview)

## Support

For issues with secret rotation:

1. Check this documentation first
2. Review Vercel deployment logs
3. Test authentication flow in development
4. Contact team security lead if needed

Remember: Regular secret rotation is a key component of application security. When in doubt, rotate!
