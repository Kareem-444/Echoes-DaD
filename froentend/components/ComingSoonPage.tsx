import Link from 'next/link';

interface ComingSoonPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function ComingSoonPage({
  eyebrow,
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-12 font-body text-on-surface">
      <div
        className="pointer-events-none absolute -left-12 top-0 h-72 w-72 rounded-full"
        style={{ opacity: 0.14, filter: 'blur(42px)', background: '#534ab7' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full"
        style={{ opacity: 0.16, filter: 'blur(48px)', background: '#9df4d2' }}
      />

      <main className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] bg-surface-container-low px-8 py-12 shadow-[0px_10px_36px_rgba(83,74,183,0.08)] md:px-12">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="font-headline text-3xl font-extrabold tracking-tight text-primary"
            >
              Echoes
            </Link>
            <Link
              href="/auth"
              className="rounded-full bg-surface-container-high px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
            >
              Back To Auth
            </Link>
          </div>

          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-primary-container/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {eyebrow}
            </span>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
              {description}
            </p>
          </div>

          <div className="mt-10 rounded-[1.5rem] bg-background/80 p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <div className="h-3 w-3 rounded-full bg-secondary" />
              <div className="h-3 w-3 rounded-full bg-tertiary-fixed-dim" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-primary">Coming Soon</h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              This part of Echoes is reserved and wired up, but the full experience is still being
              shaped. The route is live now so the app no longer drops you onto a dead link.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
