import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicPaths = ['/', '/login', '/auth', '/signup', '/api/public', '/parceiros', '/api/partnership']

function isPublicPath(pathname: string) {
    if (pathname === '/') return true
    return publicPaths.some((p) => p !== '/' && pathname.startsWith(p))
}

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Skip Supabase entirely for public paths
    if (isPublicPath(request.nextUrl.pathname)) {
        return response
    }

    let supabaseResponse = response

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let user = null
    try {
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
