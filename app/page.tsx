import Composer from '@/components/Composer';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { SignInButton, UserButton } from '@clerk/nextjs';
import styles from './page.module.css';

export default async function HomePage() {
  const user = await currentUser();
  
  let connectedPlatforms: string[] = [];
  if (user) {
    connectedPlatforms = user.externalAccounts.map(a => 
      a.provider.replace('oauth_', '').toLowerCase()
    );
  }
  
  return (
    <main className={styles.main}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 11a9 9 0 0 1 9 9"/>
              <path d="M4 4a16 16 0 0 1 16 16"/>
              <circle cx="5" cy="19" r="1"/>
            </svg>
          </div>
          <div className={styles.navBadge}>Beta</div>
        </div>
        
        <div className={styles.navRight}>
          {user ? (
            <>
              <span style={{color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginRight: "1rem"}}>
                {user.primaryEmailAddress?.emailAddress}
              </span>
              <Link href="/connections" className={styles.navLink}>Connections</Link>
              <UserButton />
            </>
          ) : (
            <div className={styles.navButton}>
              <SignInButton mode="modal" fallbackRedirectUrl="/" />
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Publish to 5 platforms at once
        </div>
        <h1 className={styles.heroTitle}>
          One post.
          <span className={styles.heroGradient}> Every platform.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Compose your content once and distribute it to X, Facebook, Instagram, TikTok, and Reddit — with platform-aware previews and instant feedback.
        </p>
      </header>

      {/* Composer */}
      <section className={styles.composerSection} aria-label="Content composer">
        <Composer connectedPlatforms={connectedPlatforms} isLoggedIn={!!user} />
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>SocialSync — Built for creators. Powered by Next.js.</p>
      </footer>
    </main>
  );
}
