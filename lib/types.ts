export type PlatformId = 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'reddit';

export type MediaRequirement = 'any' | 'video-only' | 'image-only' | 'required' | 'none';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  color: string;
  gradient: string;
  maxCharacters: number | null;
  mediaRequirement: MediaRequirement;
  requiresSubreddit?: boolean;
  supportsText: boolean;
  supportsImages: boolean;
  supportsVideos: boolean;
  charWarningThreshold?: number;
}

export interface MediaFile {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

export type PostStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PlatformPostResult {
  platform: PlatformId;
  status: PostStatus;
  message?: string;
}

export interface PostPayload {
  content: string;
  media: MediaFile[];
  platforms: PlatformId[];
  subreddit?: string;
}

export interface ApiPostResponse {
  success: boolean;
  platform: PlatformId;
  message: string;
  postId?: string;
}
