import { NextRequest } from 'next/server';
import { PlatformId } from '@/lib/types';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Simulate realistic API delay
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock platform-specific API calls
async function callTwitterAPI(content: string, hasMedia: boolean, accessToken: string): Promise<{ postId: string }> {
  await sleep(1200);
  if (!accessToken) throw new Error('Twitter access token is missing');
  // Simulate a random failure ~15% of the time
  if (Math.random() < 0.15) throw new Error('Twitter API rate limit exceeded. Try again in a few minutes.');
  return { postId: `tw_${Date.now()}` };
}

async function callFacebookAPI(content: string, accessToken: string): Promise<{ postId: string }> {
  await sleep(900);
  if (!accessToken) throw new Error('Facebook access token is missing');
  // REAL API: POST https://graph.facebook.com/{page-id}/feed
  return { postId: `fb_${Date.now()}` };
}

async function callInstagramAPI(content: string, hasMedia: boolean, accessToken: string): Promise<{ postId: string }> {
  await sleep(1500);
  if (!hasMedia) throw new Error('Instagram requires at least one image or video');
  if (!accessToken) throw new Error('Instagram access token is missing');
  // REAL API: 2-step — POST container then publish
  return { postId: `ig_${Date.now()}` };
}

async function callTikTokAPI(content: string, accessToken: string): Promise<{ postId: string }> {
  await sleep(2000);
  if (!accessToken) throw new Error('TikTok access token is missing');
  // REAL API: POST https://open.tiktokapis.com/v2/post/publish/video/init/
  return { postId: `tt_${Date.now()}` };
}

async function callRedditAPI(content: string, subreddit: string, accessToken: string): Promise<{ postId: string }> {
  await sleep(800);
  if (!subreddit) throw new Error('A subreddit name is required for Reddit posts');
  if (!accessToken) throw new Error('Reddit access token is missing');
  // REAL API: POST https://oauth.reddit.com/api/submit
  return { postId: `rd_${Date.now()}` };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const { platform } = await params;
  const validPlatforms: PlatformId[] = ['twitter', 'facebook', 'instagram', 'tiktok', 'reddit'];

  if (!validPlatforms.includes(platform as PlatformId)) {
    return Response.json(
      { success: false, message: `Unknown platform: ${platform}` },
      { status: 400 }
    );
  }

  // Map our platform IDs to Clerk's OAuth provider names
  const PLATFORM_TO_CLERK: Record<string, string> = {
    twitter: 'oauth_x',
    facebook: 'oauth_facebook',
    instagram: 'oauth_instagram',
    tiktok: 'oauth_tiktok',
    reddit: 'oauth_reddit',
  };

  const provider = (PLATFORM_TO_CLERK[platform] || `oauth_${platform}`) as any;
  
  let accountToken: string | null = null;
  try {
    const client = await clerkClient();
    const tokenResponse = await client.users.getUserOauthAccessToken(userId, provider);
    if (tokenResponse.data && tokenResponse.data.length > 0) {
      accountToken = tokenResponse.data[0].token;
    }
  } catch (error) {
    console.error(`Failed to fetch OAuth token for ${platform}:`, error);
  }

  if (!accountToken) {
    return Response.json(
      { success: false, message: `${platform} is not connected. Please connect it in Connections settings.` },
      { status: 400 }
    );
  }

  let body: { content: string; hasMedia: boolean; hasVideo: boolean; subreddit?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const { content, hasMedia, hasVideo, subreddit } = body;

  try {
    let postId: string;

    switch (platform as PlatformId) {
      case 'twitter':
        ({ postId } = await callTwitterAPI(content, hasMedia, accountToken));
        break;
      case 'facebook':
        ({ postId } = await callFacebookAPI(content, accountToken));
        break;
      case 'instagram':
        ({ postId } = await callInstagramAPI(content, hasMedia, accountToken));
        break;
      case 'tiktok':
        ({ postId } = await callTikTokAPI(content, accountToken));
        break;
      case 'reddit':
        ({ postId } = await callRedditAPI(content, subreddit || '', accountToken));
        break;
      default:
        throw new Error(`Unhandled platform: ${platform}`);
    }

    return Response.json({
      success: true,
      platform,
      message: `Successfully posted to ${platform}`,
      postId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return Response.json(
      { success: false, platform, message },
      { status: 500 }
    );
  }
}
