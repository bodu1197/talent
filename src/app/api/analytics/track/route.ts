import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

interface TrackPageViewBody {
  path: string;
  referrer?: string;
}

function getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'bot' {
  const ua = userAgent.toLowerCase();

  // Bot detection
  if (/bot|crawler|spider|crawling/i.test(ua)) {
    return 'bot';
  }

  // Mobile detection
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    return 'mobile';
  }

  // Tablet detection
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }

  return 'desktop';
}

function getClientIp(request: NextRequest): string | null {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceRoleClient();

    // Get optional user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Parse body
    const body: TrackPageViewBody = await request.json();
    const { path, referrer } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') ?? '';
    const deviceType = getDeviceType(userAgent);
    const ipAddress = getClientIp(request);

    // Generate or get session ID from cookie
    const cookies = request.cookies;
    let sessionId = cookies.get('analytics_session')?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Insert page view using service role to bypass RLS
    const { error: insertError } = await serviceSupabase.from('page_views').insert({
      path,
      user_id: user?.id || null,
      session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent.substring(0, 500), // Limit length
      referrer: referrer?.substring(0, 500) || null,
      device_type: deviceType,
      country: null, // [Future Enhancement] Add geolocation lookup if needed
    });

    if (insertError) {
      logger.error('Failed to track page view:', insertError);
      // Don't return error to client - silent failure for analytics
    }

    // Set session cookie (30 minutes expiry)
    const response = NextResponse.json({ success: true });
    response.cookies.set('analytics_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    });

    return response;
  } catch (error) {
    logger.error('Analytics tracking error:', error);
    // Return success even on error - analytics should never break the app
    return NextResponse.json({ success: true });
  }
}
