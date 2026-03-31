'use client';

import { Check, AlertCircle } from 'lucide-react';
import { PlatformId, PostStatus } from '@/lib/types';
import { PLATFORM_LIST, getPlatformConstraintMessage } from '@/lib/platforms';
import { XIcon, FacebookIcon, InstagramIcon, TikTokIcon, RedditIcon } from './PlatformIcons';
import styles from './PlatformSelector.module.css';

const PLATFORM_ICONS: Record<PlatformId, React.FC<{ size?: number }>> = {
  twitter: XIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  reddit: RedditIcon,
};

interface PlatformSelectorProps {
  selected: Set<PlatformId>;
  onToggle: (id: PlatformId) => void;
  postStatuses: Partial<Record<PlatformId, PostStatus>>;
  validationErrors: Partial<Record<PlatformId, string>>;
  connectedPlatforms?: string[];
}

export default function PlatformSelector({
  selected,
  onToggle,
  postStatuses,
  validationErrors,
  connectedPlatforms = [],
}: PlatformSelectorProps) {
  return (
    <div className={styles.grid} role="group" aria-label="Select platforms to post to">
      {PLATFORM_LIST.map((platform) => {
        const Icon = PLATFORM_ICONS[platform.id];
        const isSelected = selected.has(platform.id);
        const status = postStatuses[platform.id];
        const error = validationErrors[platform.id];
        const constraint = getPlatformConstraintMessage(platform.id);
        const isConnected = connectedPlatforms.includes(platform.id);

        return (
          <button
            key={platform.id}
            id={`platform-btn-${platform.id}`}
            className={`${styles.platformCard} ${isSelected ? styles.selected : ''} ${error ? styles.hasError : ''} ${!isConnected ? styles.disconnected : ''}`}
            style={isSelected ? { '--platform-color': platform.color, '--platform-gradient': platform.gradient } as React.CSSProperties : {}}
            onClick={() => isConnected && onToggle(platform.id)}
            aria-pressed={isSelected}
            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${platform.name}`}
            disabled={status === 'loading' || !isConnected}
          >
            <div className={styles.cardTop}>
              <div
                className={styles.iconWrapper}
                style={isSelected ? { background: platform.gradient } : {}}
              >
                <Icon size={20} />
              </div>
              <div className={styles.statusIndicator}>
                {status === 'loading' && <div className={styles.spinner} />}
                {status === 'success' && <Check size={14} className={styles.successIcon} />}
                {status === 'error' && <AlertCircle size={14} className={styles.errorIcon} />}
                {!status && isSelected && <div className={styles.selectedDot} />}
              </div>
            </div>
            <span className={styles.platformName}>{platform.name}</span>
            {constraint && <span className={styles.constraint}>{constraint}</span>}
            {error && <span className={styles.errorText}>{error}</span>}
            {!isConnected && <span className={styles.unconnectedText}>Connect to use</span>}
          </button>
        );
      })}
    </div>
  );
}
