import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 — Page Not Found | SocialSync',
  description: 'The page you requested could not be found.',
};

export default function NotFound() {
  return (
    <main className={styles.main}>
      {/* Ambient glow blobs */}
      <div className={styles.blobPurple} aria-hidden="true" />
      <div className={styles.blobPink} aria-hidden="true" />

      <div className={styles.content}>
        {/* Glassy 404 number */}
        <div className={styles.errorCodeWrapper}>
          <span className={styles.errorCode}>404</span>
        </div>

        {/* Icon */}
        <div className={styles.iconRing}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <path d="M11 8v3"/>
            <path d="M11 14h.01"/>
          </svg>
        </div>

        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.<br />
          Head back to the composer and keep creating!
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn} id="go-home-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go to Composer
          </Link>
        </div>

        {/* Platform pills decorative */}
        <div className={styles.platformPills} aria-hidden="true">
          {['X', 'Facebook', 'Instagram', 'TikTok', 'Reddit'].map((name) => (
            <span key={name} className={styles.pill}>{name}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
