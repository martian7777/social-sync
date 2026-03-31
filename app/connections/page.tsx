import { redirect } from 'next/navigation';
import { auth, signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PLATFORMS } from '@/lib/platforms';
import styles from './page.module.css';

export default async function ConnectionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  // Fetch connected accounts for this user
  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { provider: true },
  });

  const connectedProviders = new Set(accounts.map((acc) => acc.provider.toLowerCase()));

  // The primary login providers (don't show them in the "Social Media Post Connections" list)
  const isPrimaryProvider = (provider: string) => ['google', 'resend', 'nodemailer'].includes(provider);

  // Filter only our target posting platforms
  const targetPlatforms = Object.keys(PLATFORMS) as (keyof typeof PLATFORMS)[];

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          ← Back to Composer
        </Link>
        <div className={styles.navRight}>
          <span className={styles.userEmail}>{session.user.email || session.user.name}</span>
          <form action={async () => { "use server"; await signOut(); }}>
            <button type="submit" className={styles.navButton}>Sign Out</button>
          </form>
        </div>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>Social Connections</h1>
        <p className={styles.subtitle}>
          Connect your accounts below to allow SocialSync to publish on your behalf.
        </p>
      </header>

      <section className={styles.connectionsList}>
        {targetPlatforms.map((platformId) => {
          const isConnected = connectedProviders.has(platformId);
          const platform = PLATFORMS[platformId];
          return (
            <div key={platformId} className={`${styles.connectionCard} ${isConnected ? styles.connected : ''}`}>
              <div className={styles.cardInfo}>
                <div className={styles.platformIcon} style={{ background: platform.color }}>
                  {/* Just an initial for icon since we don't have the icon components here easily */}
                  {platform.name.charAt(0)}
                </div>
                <div>
                  <h3 className={styles.platformName}>{platform.name}</h3>
                  <p className={styles.platformStatus}>
                    {isConnected ? 'Connected — Ready to post' : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className={styles.cardActions}>
                {isConnected ? (
                  <form action={async () => {
                    "use server";
                    await prisma.account.deleteMany({
                      where: { userId: session.user!.id, provider: platformId }
                    });
                    // This is a rough disconnect. For real apps you'd want a proper API route or redirect.
                  }}>
                    <button type="submit" className={styles.disconnectBtn}>Disconnect</button>
                  </form>
                ) : (
                  <form action={async () => { "use server"; await signIn(platformId); }}>
                    <button type="submit" className={styles.connectBtn}>Connect</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
