'use client';

import { MediaFile, PlatformId } from '@/lib/types';
import { PLATFORMS } from '@/lib/platforms';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, ArrowUp } from 'lucide-react';
import { XIcon, FacebookIcon, InstagramIcon, TikTokIcon, RedditIcon } from './PlatformIcons';
import styles from './PlatformPreview.module.css';

interface PlatformPreviewProps {
  platformId: PlatformId;
  content: string;
  media: MediaFile[];
  subreddit?: string;
}

const PLATFORM_ICONS: Record<PlatformId, React.FC<{ size?: number }>> = {
  twitter: XIcon, facebook: FacebookIcon, instagram: InstagramIcon,
  tiktok: TikTokIcon, reddit: RedditIcon,
};

export default function PlatformPreview({ platformId, content, media, subreddit }: PlatformPreviewProps) {
  const platform = PLATFORMS[platformId];
  const Icon = PLATFORM_ICONS[platformId];
  const firstImage = media.find((m) => m.type === 'image');
  const firstVideo = media.find((m) => m.type === 'video');
  const charCount = content.length;
  const maxChars = platform.maxCharacters;
  const isOverLimit = maxChars ? charCount > maxChars : false;

  return (
    <div className={styles.preview} id={`preview-${platformId}`}>
      <div className={styles.previewHeader} style={{ background: platform.gradient }}>
        <Icon size={14} />
        <span>{platform.name} Preview</span>
      </div>

      <div className={styles.previewBody}>
        {/* Profile row */}
        <div className={styles.profileRow}>
          <div className={styles.avatar}>
            <span>Y</span>
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.displayName}>Your Account</span>
            <span className={styles.handle}>
              {platformId === 'twitter' ? '@yourusername' :
               platformId === 'reddit' ? `u/yourusername` :
               '@youraccount'}
            </span>
          </div>
          {platformId !== 'tiktok' && <MoreHorizontal size={16} className={styles.moreIcon} />}
        </div>

        {/* Reddit subreddit label */}
        {platformId === 'reddit' && (
          <div className={styles.subredditLabel}>
            r/{subreddit || 'subreddit'}
          </div>
        )}

        {/* Content */}
        {content ? (
          <p className={`${styles.contentText} ${isOverLimit ? styles.overLimit : ''}`}>
            {maxChars && content.length > maxChars + 50
              ? content.slice(0, maxChars) + '…'
              : content}
          </p>
        ) : (
          <p className={styles.placeholder}>Your content will appear here…</p>
        )}

        {/* Media */}
        {firstImage && (
          <div className={`${styles.mediaPreview} ${platformId === 'instagram' ? styles.square : ''}`}>
            <img src={firstImage.previewUrl} alt="Post media" />
          </div>
        )}
        {!firstImage && firstVideo && (
          <div className={styles.videoPlaceholder}>
            <TikTokIcon size={24} />
            <span>Video attached</span>
          </div>
        )}

        {/* Character counter */}
        {maxChars && maxChars <= 2200 && (
          <div className={`${styles.charCounter} ${isOverLimit ? styles.overLimitCounter : charCount > (platform.charWarningThreshold || maxChars * 0.9) ? styles.warnCounter : ''}`}>
            {charCount}/{maxChars}
          </div>
        )}

        {/* Platform-specific action bars */}
        {platformId === 'twitter' && (
          <div className={styles.actions}>
            <span className={styles.action}><MessageCircle size={14} /> 0</span>
            <span className={styles.action}><Share2 size={14} /> 0</span>
            <span className={styles.action}><Heart size={14} /> 0</span>
            <span className={styles.action}><Bookmark size={14} /></span>
          </div>
        )}
        {platformId === 'facebook' && (
          <div className={styles.actions}>
            <span className={styles.action}><ThumbsUp size={14} /> Like</span>
            <span className={styles.action}><MessageCircle size={14} /> Comment</span>
            <span className={styles.action}><Share2 size={14} /> Share</span>
          </div>
        )}
        {platformId === 'instagram' && (
          <div className={styles.actions}>
            <span className={styles.action}><Heart size={14} /></span>
            <span className={styles.action}><MessageCircle size={14} /></span>
            <span className={styles.action}><Share2 size={14} /></span>
            <span className={`${styles.action} ${styles.bookmarkRight}`}><Bookmark size={14} /></span>
          </div>
        )}
        {platformId === 'reddit' && (
          <div className={styles.actions}>
            <span className={styles.action}><ArrowUp size={14} /> Upvote</span>
            <span className={styles.action}><MessageCircle size={14} /> Comment</span>
            <span className={styles.action}><Share2 size={14} /> Share</span>
          </div>
        )}
        {platformId === 'tiktok' && (
          <div className={styles.tiktokActions}>
            <div className={styles.tiktokAction}><Heart size={20} /><span>0</span></div>
            <div className={styles.tiktokAction}><MessageCircle size={20} /><span>0</span></div>
            <div className={styles.tiktokAction}><Share2 size={20} /><span>0</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
