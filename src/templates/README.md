# Template Structure

This directory contains all the templates used by the SaaS generator CLI. The structure is organized as follows:

## Directory Structure

```
templates/
├── base/                 # Base Express.js application template
│   ├── src/             # Source code
│   ├── tests/           # Test files
│   └── config/          # Configuration files
├── auth/                # Authentication templates
│   ├── jwt/            # JWT + Custom Auth implementation
│   ├── auth0/          # Auth0 integration
│   ├── cognito/        # AWS Cognito integration
│   └── supabase/       # Supabase Auth integration
├── database/           # Database templates
│   ├── postgresql/     # PostgreSQL + Prisma setup
│   ├── mongodb/        # MongoDB + Mongoose setup
│   └── dynamodb/       # DynamoDB setup
└── modules/            # Additional feature modules
    ├── swagger/        # Swagger/OpenAPI documentation
    ├── ocr/            # File processing with OCR
    ├── bull/           # Background jobs with BullMQ
    ├── websocket/      # Real-time features with WebSocket
    ├── ai/             # AI integration with Gemini
    ├── stripe/         # Payment processing with Stripe
    ├── email/          # Email system with Resend
    └── analytics/      # Analytics with Mixpanel

## Template Guidelines

1. Each template should be self-contained with its own:
   - Dependencies in package.json
   - Configuration files
   - Environment variables
   - Documentation

2. Templates should use consistent coding style and patterns

3. All templates should include:
   - README.md with setup instructions
   - .env.example file
   - Basic tests
   - TypeScript types/interfaces where applicable

4. Module templates should export clear integration points for the base application 