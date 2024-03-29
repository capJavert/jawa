const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY'
    },
    {
        key: 'Referrer-Policy',
        value: 'no-referrer'
    }
]

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    poweredByHeader: false,
    headers: async () => {
        return [
            {
                source: '/:path*',
                headers: securityHeaders
            }
        ]
    },
    rewrites: async () => {
        return [
            {
                source: '/cloud/runners/beta',
                destination: process.env.CLOUD_RUNNER_BETA_URL
            }
        ]
    }
}

module.exports = nextConfig
