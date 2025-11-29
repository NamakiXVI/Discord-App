# Discord App Documentation Site

A modern, accessible documentation and configuration site for Discord applications with client-side routing and interactive previews.

## Security Notice

⚠️ **IMPORTANT SECURITY INFORMATION**

- This site is client-side only and does not provide server-side validation
- Never paste real Discord tokens, client secrets, or private keys into any form
- All endpoint testing is simulated using localStorage and mock data
- Real implementations must handle signature verification and security on the server

## Features

- Four main sections: Interactions Endpoint, Linked Roles Verification, Terms of Service, Privacy Policy
- Client-side routing with History API
- Responsive design with mobile navigation
- Dark/light theme toggle
- Copy-to-clipboard for code blocks
- Print/save as PDF functionality
- Accessible with proper ARIA labels and keyboard navigation

## Server-Side Responsibilities

For production use, you must implement:

1. Signature verification for Discord interactions
2. Secure storage of tokens and secrets
3. Proper OAuth2 flow for linked roles
4. HTTPS for all endpoints
5. Rate limiting and abuse prevention

## Customization

Replace all `{{PLACEHOLDER}}` values with your actual information:
- `{{ORGANIZATION_NAME}}`
- `{{SUPPORT_EMAIL}}`
- Endpoint URLs
- Legal document details

## Browser Support

Works in modern browsers with ES6+ support. Includes fallbacks for older browsers where possible.