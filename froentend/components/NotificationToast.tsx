'use client';

import { useEffect, useRef } from 'react';

import type { NotificationPayload } from '@/lib/types';

interface NotificationToastProps {
  notification: NotificationPayload;
  onDismiss: () => void;
}

const toastStyles = {
  chat_message: {
    icon: 'chat_bubble',
    shell: 'border-sky-300/70 bg-sky-950/90 text-sky-50',
    accent: 'text-sky-200',
    label: 'New message',
  },
  new_match: {
    icon: 'auto_awesome',
    shell: 'border-violet-300/70 bg-violet-950/90 text-violet-50',
    accent: 'text-violet-200',
    label: 'New match',
  },
  resonance_milestone: {
    icon: 'star',
    shell: 'border-amber-300/70 bg-amber-950/90 text-amber-50',
    accent: 'text-amber-200',
    label: 'Milestone reached',
  },
} as const;

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => onDismissRef.current(), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const style = toastStyles[notification.type];

  let title: string = style.label;
  let body = '';

  if (notification.type === 'chat_message') {
    title = `${notification.sender_anonymous_name} sent a message`;
    body = notification.content;
  }

  if (notification.type === 'new_match') {
    title = `${notification.anonymous_name} matched with you`;
    body = `${notification.harmony_score}% harmony is waiting in your matches.`;
  }

  if (notification.type === 'resonance_milestone') {
    title = `${notification.milestone} resonances reached`;
    body = notification.echo_preview;
  }

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-3xl border px-4 py-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${style.shell}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-white/10 p-2">
          <span
            className={`material-symbols-outlined text-xl ${style.accent}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {style.icon}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{style.label}</p>
          <p className="mt-1 text-sm font-semibold leading-5">{title}</p>
          <p className="mt-1 max-h-[4.5rem] overflow-hidden text-sm leading-5 text-white/80">{body}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss notification"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
