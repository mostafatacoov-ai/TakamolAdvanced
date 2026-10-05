import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // CV uploads (5 MB), image uploads (10 MB) and quotation attachments (10 × 10 MB) go through server actions
      bodySizeLimit: '60mb',
      // extra host names allowed to post forms, if the host's proxy rewrites them
      allowedOrigins: process.env.SERVER_ACTIONS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean),
    },
  },
};

export default withNextIntl(nextConfig);
