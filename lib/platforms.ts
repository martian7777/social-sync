import { PlatformConfig, PlatformId } from './types';

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#000000',
    gradient: 'linear-gradient(135deg, #1a1a1a, #333333)',
    maxCharacters: 280,
    charWarningThreshold: 260,
    mediaRequirement: 'any',
    supportsText: true,
    supportsImages: true,
    supportsVideos: true,
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0d5bd1)',
    maxCharacters: 63206,
    mediaRequirement: 'any',
    supportsText: true,
    supportsImages: true,
    supportsVideos: true,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
    maxCharacters: 2200,
    charWarningThreshold: 2000,
    mediaRequirement: 'required',
    supportsText: true,
    supportsImages: true,
    supportsVideos: true,
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    color: '#FF0050',
    gradient: 'linear-gradient(135deg, #010101, #FF0050)',
    maxCharacters: 2200,
    charWarningThreshold: 2000,
    mediaRequirement: 'video-only',
    supportsText: true,
    supportsImages: false,
    supportsVideos: true,
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    gradient: 'linear-gradient(135deg, #FF4500, #cc3700)',
    maxCharacters: 40000,
    mediaRequirement: 'any',
    requiresSubreddit: true,
    supportsText: true,
    supportsImages: true,
    supportsVideos: true,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export function getPlatformConstraintMessage(platformId: PlatformId): string {
  const p = PLATFORMS[platformId];
  const msgs: string[] = [];
  if (p.maxCharacters && p.maxCharacters <= 280) msgs.push(`${p.maxCharacters} char limit`);
  if (p.mediaRequirement === 'video-only') msgs.push('Video only');
  if (p.mediaRequirement === 'required') msgs.push('Media required');
  if (p.requiresSubreddit) msgs.push('Subreddit required');
  return msgs.join(' · ');
}

export function validatePostForPlatform(
  platformId: PlatformId,
  content: string,
  hasMedia: boolean,
  hasVideo: boolean
): string | null {
  const p = PLATFORMS[platformId];

  if (p.maxCharacters && content.length > p.maxCharacters) {
    return `Content exceeds ${p.maxCharacters} character limit for ${p.name}`;
  }
  if (p.mediaRequirement === 'required' && !hasMedia) {
    return `${p.name} requires at least one image or video`;
  }
  if (p.mediaRequirement === 'video-only' && hasMedia && !hasVideo) {
    return `${p.name} only supports video uploads`;
  }
  if (!p.supportsText && content.trim() && !hasMedia) {
    return `${p.name} requires a media attachment`;
  }
  return null;
}
