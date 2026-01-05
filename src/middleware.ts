import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: ['/admin/:path*'],
};

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const auth = basicAuth.split(' ')[1];
        const [user, pwd] = atob(auth).split(':');

        // Load credentials from environment
        const validUser = process.env.ADMIN_USER;
        const validPass = process.env.ADMIN_PASSWORD;

        if (user === validUser && pwd === validPass) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Auth Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}
