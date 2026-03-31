import Composer from '@/components/Composer';
import Link from 'next/link';
import { auth, signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export default async function HomePage() {
  const session = await auth();
  
  let connectedPlatforms: string[] = [];
  if (session?.user?.id) {
    const accs = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true }
    });
    connectedPlatforms = accs.map(a => a.provider.toLowerCase());
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
          {session ? (
            <>
              <span style={{color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginRight: "1rem"}}>
                {session.user?.email}
              </span>
              <Link href="/connections" className={styles.navLink}>Connections</Link>
              <form action={async () => { "use server"; await signOut(); }}>
                <button type="submit" className={styles.navButton}>Sign Out</button>
              </form>
            </>
          ) : (
            <form action={async () => { "use server"; await signIn(); }}>
              <button type="submit" className={styles.navButton}>Sign In</button>
            </form>
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
        <Composer connectedPlatforms={connectedPlatforms} isLoggedIn={!!session} />
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>SocialSync — Built for creators. Powered by Next.js.</p>
      </footer>
    </main>
  );
}
