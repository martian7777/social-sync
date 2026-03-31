import { NextRequest } from 'next/server';
import { PlatformId } from '@/lib/types';

// Simulate realistic API delay
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock platform-specific API calls
async function callTwitterAPI(content: string, hasMedia: boolean): Promise<{ postId: string }> {
  await sleep(1200);
  // Simulate a random failure ~15% of the time
  if (Math.random() < 0.15) throw new Error('Twitter API rate limit exceeded. Try again in a few minutes.');
  return { postId: `tw_${Date.now()}` };
}

async function callFacebookAPI(content: string, pageId: string): Promise<{ postId: string }> {
  await sleep(900);
  if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    throw new Error('Facebook Page Access Token not configured. Add FACEBOOK_PAGE_ACCESS_TOKEN to .env.local');
  }
  // REAL API: POST https://graph.facebook.com/{page-id}/feed
  return { postId: `fb_${Date.now()}` };
}

async function callInstagramAPI(content: string, hasMedia: boolean): Promise<{ postId: string }> {
  await sleep(1500);
  if (!hasMedia) throw new Error('Instagram requires at least one image or video');
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    throw new Error('Instagram Access Token not configured. Add INSTAGRAM_ACCESS_TOKEN to .env.local');
  }
  // REAL API: 2-step — POST container then publish
  return { postId: `ig_${Date.now()}` };
}

async function callTikTokAPI(content: string): Promise<{ postId: string }> {
  await sleep(2000);
  if (!process.env.TIKTOK_ACCESS_TOKEN) {
    throw new Error('TikTok Access Token not configured. Add TIKTOK_ACCESS_TOKEN to .env.local');
  }
  // REAL API: POST https://open.tiktokapis.com/v2/post/publish/video/init/
  return { postId: `tt_${Date.now()}` };
}

async function callRedditAPI(content: string, subreddit: string): Promise<{ postId: string }> {
  await sleep(800);
  if (!subreddit) throw new Error('A subreddit name is required for Reddit posts');
  if (!process.env.REDDIT_ACCESS_TOKEN) {
    throw new Error('Reddit Access Token not configured. Add REDDIT_ACCESS_TOKEN to .env.local');
  }
  // REAL API: POST https://oauth.reddit.com/api/submit
  return { postId: `rd_${Date.now()}` };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const validPlatforms: PlatformId[] = ['twitter', 'facebook', 'instagram', 'tiktok', 'reddit'];

  if (!validPlatforms.includes(platform as PlatformId)) {
    return Response.json(
      { success: false, message: `Unknown platform: ${platform}` },
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
        ({ postId } = await callTwitterAPI(content, hasMedia));
        break;
      case 'facebook':
        ({ postId } = await callFacebookAPI(content, process.env.FACEBOOK_PAGE_ID || 'mock_page'));
        break;
      case 'instagram':
        ({ postId } = await callInstagramAPI(content, hasMedia));
        break;
      case 'tiktok':
        ({ postId } = await callTikTokAPI(content));
        break;
      case 'reddit':
        ({ postId } = await callRedditAPI(content, subreddit || ''));
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
