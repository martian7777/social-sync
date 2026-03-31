import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { UserProfile, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import styles from './page.module.css';

export default async function ConnectionsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/');
  }

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          ← Back to Composer
        </Link>
        <div className={styles.navRight}>
          <span className={styles.userEmail}>
            {user.primaryEmailAddress?.emailAddress}
          </span>
          <UserButton />
        </div>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>Social Connections</h1>
        <p className={styles.subtitle}>
          Connect your accounts in your Clerk Profile below to allow SocialSync to publish on your behalf.
          Make sure to link your social accounts under the "Connected accounts" section.
        </p>
      </header>

      <section style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <UserProfile routing="hash" />
      </section>
    </main>
  );
}
