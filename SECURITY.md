# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Updates

### Current Status
- ✅ Next.js updated to 15.4.5+ (CVE fixed)
- ✅ All dependencies pinned to specific versions
- ✅ Server-side authentication implemented
- ✅ Security headers configured
- ⚠️ xlsx package has known vulnerabilities (no fix available)

### Known Issues

#### xlsx Package Vulnerabilities
The `xlsx` package has known security issues:
- Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
- ReDoS vulnerability (GHSA-5pgg-2g8v-p4x9)

**Mitigation**: 
- Only use xlsx for trusted file uploads
- Validate and sanitize all Excel file inputs
- Consider alternative libraries if security is critical
- Restrict file upload access to authenticated admins only

## Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use strong, unique values for all secrets
- Rotate credentials regularly
- Use different credentials for dev/staging/production

### Authentication
- Enforce strong password policies
- Enable MFA for admin accounts in Supabase
- Regularly review user access logs
- Implement session timeout policies

### Database
- Enable Row Level Security (RLS) in production
- Use prepared statements (Supabase handles this)
- Regular backups (automated via Supabase)
- Monitor for suspicious queries

### File Uploads
- Validate file types and sizes
- Scan uploaded files for malware
- Store files in Supabase Storage (not filesystem)
- Use signed URLs for sensitive content

### API Security
- Rate limiting implemented via `lib/rate-limiter.ts`
- Input validation and sanitization
- CORS properly configured
- API routes protected by authentication

## Reporting a Vulnerability

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security concerns to: [your-security-email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Checklist for Deployment

- [ ] All environment variables set in production
- [ ] `.env.local` not committed to repository
- [ ] Strong passwords for all admin accounts
- [ ] MFA enabled for critical accounts
- [ ] RLS policies enabled in Supabase
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured (done in middleware)
- [ ] Regular dependency updates scheduled
- [ ] Backup system tested and working
- [ ] Error logging configured (not exposing sensitive data)
- [ ] Rate limiting tested
- [ ] File upload restrictions in place

## Regular Maintenance

### Weekly
- Review authentication logs
- Check for failed login attempts
- Monitor error rates

### Monthly
- Update dependencies: `npm update`
- Review and rotate API keys if needed
- Test backup restoration process
- Review user access permissions

### Quarterly
- Security audit of codebase
- Penetration testing
- Review and update security policies
- Update this document

## Contact

For security-related questions: [your-contact-info]
