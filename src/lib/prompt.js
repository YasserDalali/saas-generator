import chalk from 'chalk';
import inquirer from 'inquirer';

class PromptsManager {
  async getProjectConfig() {
    return await inquirer.prompt([
      {
        type: 'list',
        name: 'auth',
        message: '╚═════════════════ AUTHENTICATION METHOD ══════════════════╝\nSelect authentication method:',
        choices: [
          { name: 'JWT + Custom Auth', value: 'jwt' },
          { name: chalk.gray('Auth0 Integration'), value: 'auth0', disabled: '- coming soon' },
          { name: chalk.gray('AWS Cognito'), value: 'cognito', disabled: '- coming soon' },
          { name: chalk.gray('Supabase Auth'), value: 'supabase', disabled: '- coming soon' }
        ]
      },
      {
        type: 'list',
        name: 'database',
        message: '╚═════════════════ DATABASE SETUP ══════════════════╝\nChoose your database setup:',
        choices: [
          { name: 'PostgreSQL + Prisma', value: 'prisma' },
          { name: 'MongoDB + Mongoose', value: 'mongoose' },
          { name: chalk.gray('DynamoDB'), value: 'dynamodb', disabled: '- coming soon' }
        ]
      },
      {
        type: 'checkbox',
        name: 'modules',
        message: '╚═════════════════ ADDITIONAL MODULES ══════════════════╝\nSelect additional modules:',
        choices: [
          { name: 'Swagger/OpenAPI docs', value: 'docs' },
          { name: chalk.gray('File processing (OCR)'), value: 'ocr', disabled: '- coming soon' },
          { name: 'Background jobs (BullMQ)', value: 'bullmq' },
          { name: chalk.gray('Real-time features (WebSocket)'), value: 'websocket', disabled: '- coming soon' },
          { name: 'AI integration (Gemini)', value: 'gemini-ai' },
          { name: chalk.gray('Payment processing (Stripe)'), value: 'stripe', disabled: '- coming soon' },
          { name: 'Email system (Resend)', value: 'mail' },
          { name: chalk.gray('Analytics (Mixpanel)'), value: 'analytics', disabled: '- coming soon' },
          { name: chalk.gray('Logs (Sentry)'), value: 'sentry', disabled: '- coming soon' }
        ]
      }
    ]);
  }
}

export default PromptsManager;