'use client';
import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-primary">

      {/* Navbar */}
      <nav
        className="fixed top-0 w-full z-50 shadow-[0px_4px_24px_rgba(83,74,183,0.08)]"
        style={{ background: 'rgba(252, 249, 245, 0.8)', backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div
            className="text-2xl font-bold bg-clip-text text-transparent font-headline tracking-tight"
            style={{ backgroundImage: 'linear-gradient(to right, #3b309e, #534ab7)' }}
          >
            Echoes
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-stone-500 hover:text-indigo-700 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-stone-500 hover:text-indigo-700 transition-colors font-medium">How it works</a>
          </div>
          <Link href="/auth">
            <button className="signature-gradient text-on-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
              Enter the Void
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden px-6">
        {/* Floating Geometric Shapes (Decorative) */}
        <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full border-8 border-primary-container" />
          <div className="absolute top-1/2 right-0 w-80 h-80 rotate-45 bg-secondary-fixed-dim" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-xl border-4 border-tertiary-container" />
        </div>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-primary leading-tight mb-8">
            You are not alone <br /> in the void
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            A digital stream of consciousness where every thought is a ripple and every ripple finds its shore. Purely anonymous, deeply human.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/auth">
              <button className="signature-gradient text-on-primary px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-indigo-900/10">
                Start Echoing
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="px-10 py-5 rounded-full text-lg font-semibold text-primary hover:bg-surface-container-low transition-colors">
                See how it works
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-6 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex -space-x-4 mb-8">
            <div className="w-16 h-16 rounded-full border-4 border-background bg-primary-fixed-dim flex items-center justify-center overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary-container opacity-40" />
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-background bg-secondary-fixed flex items-center justify-center overflow-hidden">
              <div className="w-8 h-8 rotate-45 bg-on-secondary-container opacity-40" />
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-background bg-tertiary-fixed-dim flex items-center justify-center overflow-hidden">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-on-tertiary-fixed opacity-40" />
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-background bg-primary-container flex items-center justify-center text-on-primary font-bold">
              12k+
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-headline font-bold text-on-surface mb-2">Join 12,000+ souls already echoing</p>
            <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm">2.4M echoes shared</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">circle</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">Share</h3>
              <p className="text-on-surface-variant leading-relaxed">Cast your unfiltered thoughts into the stream. No identities, just the weight of words.</p>
            </div>
            <div className="p-10 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-secondary text-3xl">hexagon</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">Find</h3>
              <p className="text-on-surface-variant leading-relaxed">Navigate through thousands of whispers. Find the ones that resonate with your own frequency.</p>
            </div>
            <div className="p-10 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-tertiary text-3xl">change_history</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">Connect</h3>
              <p className="text-on-surface-variant leading-relaxed">Realize you&apos;re never alone. Connect through the shared silence of anonymous understanding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-40">

          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <span className="bg-primary-container/10 text-primary-container px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase">
                Atmospheric Void
              </span>
              <h2 className="text-5xl font-headline font-extrabold leading-tight">Your thoughts, finally weightless.</h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                We provide a space that feels like deep ocean or night sky—fluid, vast, and non-judgmental. Your contributions are signatures, not profiles.
              </p>
            </div>
            <div className="flex-1 w-full aspect-square rounded-lg bg-surface-container-low flex items-center justify-center p-12 overflow-hidden relative">
              <div className="w-64 h-64 rounded-full border-[24px] border-primary-fixed-dim absolute transform -translate-x-12 translate-y-8 opacity-40" />
              <div className="w-48 h-48 rounded-full bg-indigo-200/50 absolute backdrop-blur-xl" />
              <div className="w-12 h-12 rounded-full bg-primary-container absolute right-1/4 top-1/3" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-20">
            <div className="flex-1 space-y-8">
              <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase">
                Emotional Matching
              </span>
              <h2 className="text-5xl font-headline font-extrabold leading-tight">Find your resonance.</h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Our algorithms don&apos;t track your data; they track the frequency of your thoughts. We match you with echoes that share your emotional landscape.
              </p>
            </div>
            <div className="flex-1 w-full aspect-square rounded-lg bg-surface-container-low flex items-center justify-center p-12 overflow-hidden relative">
              <div className="w-72 h-72 rotate-12 border-[2px] border-secondary-fixed-dim absolute opacity-60" />
              <div className="w-72 h-72 rotate-45 border-[2px] border-secondary-fixed-dim absolute opacity-30" />
              <div className="w-32 h-32 rounded-xl bg-secondary-fixed absolute transform -translate-x-8 -translate-y-8 blur-3xl opacity-50" />
              <div className="w-16 h-16 rounded-full bg-secondary text-secondary-fixed flex items-center justify-center absolute z-10">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Echoes Section */}
      <section className="py-32 px-6 bg-surface-container-high/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-headline font-extrabold text-center mb-20">Live Ripples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1 */}
            <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_4px_24px_rgba(83,74,183,0.05)] hover:-translate-y-2 transition-transform duration-300">
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 rounded-full bg-primary-fixed-dim/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container">radio_button_unchecked</span>
                </div>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">me too</span>
              </div>
              <p className="text-xl font-headline font-semibold mb-12 italic text-on-surface leading-snug">
                &quot;Sometimes I wonder if the world is as quiet as my apartment at 3 AM.&quot;
              </p>
              <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                <span>Silent Circle</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">waves</span>
                  <span>412 resonance</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_4px_24px_rgba(83,74,183,0.05)] hover:-translate-y-2 transition-transform duration-300">
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">hexagon</span>
                </div>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">me too</span>
              </div>
              <p className="text-xl font-headline font-semibold mb-12 italic text-on-surface leading-snug">
                &quot;There&apos;s a specific kind of freedom in knowing no one knows it&apos;s me writing this.&quot;
              </p>
              <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                <span>Gilded Hexagon</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">waves</span>
                  <span>1.2k resonance</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_4px_24px_rgba(83,74,183,0.05)] hover:-translate-y-2 transition-transform duration-300">
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed-dim/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">square</span>
                </div>
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-xs font-bold">me too</span>
              </div>
              <p className="text-xl font-headline font-semibold mb-12 italic text-on-surface leading-snug">
                &quot;I finally left that job today. The air feels thinner and clearer already.&quot;
              </p>
              <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                <span>Dotted Square</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">waves</span>
                  <span>89 resonance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary-container -z-10 opacity-[0.03]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-headline font-extrabold mb-8 text-primary">Your echo is waiting</h2>
            <p className="text-xl text-on-surface-variant max-w-xl mx-auto font-light">
              Join the fluid stream. Your first ripple is the hardest part. After that, it&apos;s just floating.
            </p>
          </div>
          <Link href="/auth">
            <button className="signature-gradient text-on-primary px-12 py-6 rounded-full text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-indigo-500/30">
              Begin Your Journey
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
            <div>
              <div className="text-3xl font-headline font-extrabold text-primary mb-6">Echoes</div>
              <p className="text-on-surface-variant max-w-xs font-light">The anonymous layer of the internet. Built for connection, not for data.</p>
            </div>
            <div className="grid grid-cols-2 gap-20">
              <div className="flex flex-col gap-4">
                <p className="font-bold text-sm uppercase tracking-widest text-primary mb-2">Navigation</p>
                <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
                <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors">Features</a>
                <Link href="/safety" className="text-on-surface-variant hover:text-primary transition-colors">Safety</Link>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-bold text-sm uppercase tracking-widest text-primary mb-2">Legal</p>
                <Link href="/privacy" className="text-on-surface-variant hover:text-primary transition-colors">Privacy</Link>
                <Link href="/ethics" className="text-on-surface-variant hover:text-primary transition-colors">Ethics</Link>
                <Link href="/terms" className="text-on-surface-variant hover:text-primary transition-colors">Terms</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-outline-variant/20 gap-6">
            <p className="text-on-surface-variant text-sm font-medium">© 2024 Echoes. All whispers reserved.</p>
            <div className="flex items-center gap-6">
              <div className="w-8 h-8 rounded-full bg-primary-fixed-dim" />
              <div className="w-8 h-8 rounded-full bg-secondary-fixed" />
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
