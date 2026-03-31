'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Send, Eye, EyeOff, Hash, AlertTriangle } from 'lucide-react';
import { MediaFile, PlatformId, PostStatus } from '@/lib/types';
import { PLATFORMS, validatePostForPlatform } from '@/lib/platforms';
import PlatformSelector from './PlatformSelector';
import PlatformPreview from './PlatformPreview';
import MediaUploader from './MediaUploader';
import styles from './Composer.module.css';

interface ComposerProps {
  connectedPlatforms?: string[];
  isLoggedIn?: boolean;
}

export default function Composer({ connectedPlatforms = [], isLoggedIn = false }: ComposerProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PlatformId>>(new Set());
  const [subreddit, setSubreddit] = useState('');
  const [postStatuses, setPostStatuses] = useState<Partial<Record<PlatformId, PostStatus>>>({});
  const [showPreview, setShowPreview] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const hasMedia = media.length > 0;
  const hasVideo = media.some((m) => m.type === 'video');
  const hasImages = media.some((m) => m.type === 'image');

  // Compute per-platform validation errors
  const validationErrors = useCallback((): Partial<Record<PlatformId, string>> => {
    const errors: Partial<Record<PlatformId, string>> = {};
    for (const pid of selectedPlatforms) {
      const err = validatePostForPlatform(pid, content, hasMedia, hasVideo);
      if (err) errors[pid] = err;
    }
    if (selectedPlatforms.has('reddit') && !subreddit.trim()) {
      errors['reddit'] = 'Subreddit name required';
    }
    return errors;
  }, [content, hasMedia, hasVideo, selectedPlatforms, subreddit]);

  function togglePlatform(id: PlatformId) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Clear status when deselecting
    setPostStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function setStatus(platform: PlatformId, status: PostStatus) {
    setPostStatuses((prev) => ({ ...prev, [platform]: status }));
  }

  async function postToPlatform(platform: PlatformId): Promise<boolean> {
    setStatus(platform, 'loading');
    const toastId = toast.loading(`Posting to ${PLATFORMS[platform].name}…`);
    try {
      const res = await fetch(`/api/post/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          hasMedia,
          hasVideo,
          subreddit: platform === 'reddit' ? subreddit : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unknown error');

      setStatus(platform, 'success');
      toast.success(`Posted to ${PLATFORMS[platform].name}!`, { id: toastId });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post';
      setStatus(platform, 'error');
      toast.error(`${PLATFORMS[platform].name}: ${message}`, { id: toastId, duration: 6000 });
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedPlatforms.size === 0) {
      toast.error('Please select at least one platform to post to');
      return;
    }
    if (!content.trim() && !hasMedia) {
      toast.error('Add some content or media before posting');
      return;
    }

    const errors = validationErrors();
    if (Object.keys(errors).length > 0) {
      const platformWithError = Object.keys(errors)[0] as PlatformId;
      toast.error(errors[platformWithError]!);
      return;
    }

    setIsPosting(true);
    // Post to all platforms concurrently — each reports its own result
    const platforms = Array.from(selectedPlatforms);
    await Promise.allSettled(platforms.map((p) => postToPlatform(p)));
    setIsPosting(false);
  }

  function handleReset() {
    setContent('');
    setMedia([]);
    setSelectedPlatforms(new Set());
    setSubreddit('');
    setPostStatuses({});
  }

  const errors = validationErrors();
  const allSucceeded = selectedPlatforms.size > 0 && Array.from(selectedPlatforms).every((p) => postStatuses[p] === 'success');
  const needsSubreddit = selectedPlatforms.has('reddit');

  // Determine media constraint based on selected platforms
  const needsVideoOnly = selectedPlatforms.has('tiktok') && selectedPlatforms.size === 1;
  const needsImagesOnly = !needsVideoOnly && !selectedPlatforms.has('tiktok') && hasImages;

  return (
    <div className={styles.composerLayout}>
      <form className={styles.composerCard} onSubmit={handleSubmit} id="composer-form">
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.cardTitle}>New Post</h2>
            <p className={styles.cardSubtitle}>Compose once, publish everywhere</p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.previewToggle}
              onClick={() => setShowPreview((v) => !v)}
              id="toggle-preview-btn"
              title={showPreview ? 'Hide previews' : 'Show previews'}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>
        </div>

        {/* Platform Selector */}
        <section className={styles.section}>
          <label className={styles.sectionLabel}>
            <Hash size={14} /> Platforms
          </label>
          <PlatformSelector
            selected={selectedPlatforms}
            onToggle={togglePlatform}
            postStatuses={postStatuses}
            validationErrors={errors}
            connectedPlatforms={connectedPlatforms}
          />
        </section>

        {/* Reddit Subreddit Input */}
        {needsSubreddit && (
          <section className={`${styles.section} ${styles.subredditSection}`}>
            <label className={styles.sectionLabel} htmlFor="subreddit-input">
              r/ Subreddit
            </label>
            <div className={styles.subredditWrapper}>
              <span className={styles.subredditPrefix}>r/</span>
              <input
                id="subreddit-input"
                className={styles.subredditInput}
                type="text"
                placeholder="e.g. technology, programming…"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value.replace(/^r\//, '').replace(/\s/g, ''))}
              />
            </div>
          </section>
        )}

        {/* Text Editor */}
        <section className={styles.section}>
          <label className={styles.sectionLabel} htmlFor="content-textarea">
            Content
          </label>
          <div className={styles.textareaWrapper}>
            <textarea
              id="content-textarea"
              className={styles.textarea}
              placeholder="What's on your mind? Write your post here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
            {/* Per-platform char counters below textarea */}
            {selectedPlatforms.size > 0 && (
              <div className={styles.charCounters}>
                {Array.from(selectedPlatforms).map((pid) => {
                  const max = PLATFORMS[pid].maxCharacters;
                  if (!max || max > 2200) return null;
                  const count = content.length;
                  const remaining = max - count;
                  const isOver = remaining < 0;
                  const isWarn = remaining >= 0 && remaining < 30;
                  return (
                    <span
                      key={pid}
                      className={`${styles.charBadge} ${isOver ? styles.charOver : isWarn ? styles.charWarn : ''}`}
                    >
                      {PLATFORMS[pid].name}: {remaining < 0 ? remaining : remaining} chars left
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Media Upload */}
        <section className={styles.section}>
          <label className={styles.sectionLabel}>
            Media
            {needsVideoOnly && (
              <span className={styles.constraintBadge}><AlertTriangle size={10} /> TikTok: Video only</span>
            )}
          </label>
          <MediaUploader
            files={media}
            onChange={setMedia}
            acceptVideosOnly={needsVideoOnly}
          />
        </section>

        {/* Submit Actions */}
        <div className={styles.actions}>
          {allSucceeded ? (
            <button type="button" className={styles.resetBtn} onClick={handleReset} id="new-post-btn">
              ✨ New Post
            </button>
          ) : (
            <>
              <button type="button" className={styles.clearBtn} onClick={handleReset} id="clear-btn" disabled={isPosting}>
                Clear
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                id="publish-btn"
                disabled={isPosting || selectedPlatforms.size === 0}
              >
                {isPosting ? (
                  <>
                    <div className={styles.btnSpinner} />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Publish{selectedPlatforms.size > 0 ? ` to ${selectedPlatforms.size} Platform${selectedPlatforms.size > 1 ? 's' : ''}` : ''}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Preview Panel */}
      {showPreview && selectedPlatforms.size > 0 && (
        <aside className={styles.previewPanel} aria-label="Post previews">
          <h3 className={styles.previewTitle}>Live Preview</h3>
          <div className={styles.previewGrid}>
            {Array.from(selectedPlatforms).map((pid) => (
              <PlatformPreview
                key={pid}
                platformId={pid}
                content={content}
                media={media}
                subreddit={subreddit}
              />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
