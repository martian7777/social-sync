import { NextRequest } from 'next/server';
import { PlatformId } from '@/lib/types';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Real Twitter/X API v2 — POST https://api.x.com/2/tweets
async function callTwitterAPI(content: string, hasMedia: boolean, accessToken: string): Promise<{ postId: string }> {
  if (!accessToken) throw new Error('Twitter access token is missing');

  const response = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail = errorData?.detail || errorData?.title || `HTTP ${response.status}`;
    throw new Error(`Twitter API error: ${detail}`);
  }

  const data = await response.json();
  return { postId: data.data?.id || `tw_${Date.now()}` };
}

// Facebook — requires Page Access Token and Page ID (not user token)
async function callFacebookAPI(content: string, accessToken: string): Promise<{ postId: string }> {
  if (!accessToken) throw new Error('Facebook access token is missing');
  // To actually post, you need a Page Access Token and Page ID
  // POST https://graph.facebook.com/{page-id}/feed?message={content}&access_token={token}
  throw new Error('Facebook posting requires a Page Access Token. Configure it in your Clerk Dashboard with pages_manage_posts scope.');
}

// Instagram — requires Business Account + media container flow
async function callInstagramAPI(content: string, hasMedia: boolean, accessToken: string): Promise<{ postId: string }> {
  if (!hasMedia) throw new Error('Instagram requires at least one image or video');
  if (!accessToken) throw new Error('Instagram access token is missing');
  // Instagram API requires a 2-step process: create media container, then publish
  throw new Error('Instagram posting requires a Business/Creator account and the Content Publishing API. This needs additional setup.');
}

// TikTok — requires video upload flow
async function callTikTokAPI(content: string, accessToken: string): Promise<{ postId: string }> {
  if (!accessToken) throw new Error('TikTok access token is missing');
  // TikTok only supports video posts via their Content Posting API
  throw new Error('TikTok posting requires video content and the Content Posting API. This needs additional setup.');
}

// Reddit — POST https://oauth.reddit.com/api/submit
async function callRedditAPI(content: string, subreddit: string, accessToken: string): Promise<{ postId: string }> {
  if (!subreddit) throw new Error('A subreddit name is required for Reddit posts');
  if (!accessToken) throw new Error('Reddit access token is missing');

  const formData = new URLSearchParams();
  formData.append('sr', subreddit);
  formData.append('kind', 'self');
  formData.append('title', content.substring(0, 300));
  formData.append('text', content);

  const response = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'SocialSync/1.0',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Reddit API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.json?.errors?.length) {
    throw new Error(`Reddit error: ${data.json.errors[0][1]}`);
  }

  return { postId: data.json?.data?.id || `rd_${Date.now()}` };
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
