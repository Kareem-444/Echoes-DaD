export interface GeometryProps {
  shape: 'circle' | 'hexagon' | 'triangle' | 'square' | 'diamond';
  color: string;
}

export interface EchoPost {
  id: string;
  avatar: GeometryProps;
  username: string;
  timeAgo: string;
  content: string;
  resonances: number;
  isLiked: boolean;
}

export interface MatchProfile {
  id: string;
  avatar: GeometryProps;
  username: string;
  matchedVia: string;
  harmonyPercent: number;
  excerpt: string;
  sharedAgo: string;
}

export interface UserProfile {
  username: string;
  tokens: number;
  echoesCount: number;
  resonancesCount: number;
  avatar: GeometryProps;
  memberSince: string;
}

export const MOCK_PROFILE: UserProfile = {
  username: "Curious Hexagon",
  tokens: 50,
  echoesCount: 12,
  resonancesCount: 128,
  avatar: { shape: 'hexagon', color: '#5dcaa5' },
  memberSince: "MEMBER SINCE TWILIGHT"
};

export const MOCK_ECHOES: EchoPost[] = [
  {
    id: '1',
    avatar: { shape: 'circle', color: '#3b309e' },
    username: "Silent Circle",
    timeAgo: "3 minutes ago",
    content: "I still visit the park where we first met, just to sit on the same bench and wonder if you ever do the same.",
    resonances: 42,
    isLiked: false
  },
  {
    id: '2',
    avatar: { shape: 'hexagon', color: '#006c52' },
    username: "Gilded Hexagon",
    timeAgo: "1 hour ago",
    content: "Sometimes I pretend I'm in a movie when I'm walking home alone. It makes the loneliness feel like a plot point instead of a reality.",
    resonances: 128,
    isLiked: true
  },
  {
    id: '3',
    avatar: { shape: 'triangle', color: '#474553' },
    username: "Looming Triangle",
    timeAgo: "4 hours ago",
    content: "I haven't told my parents I quit my high-paying job for a ceramics studio. I'm happier than I've been in ten years, but I'm terrified they'll see it as failure.",
    resonances: 89,
    isLiked: false
  },
  {
    id: '4',
    avatar: { shape: 'square', color: '#534ab7' },
    username: "Dotted Square",
    timeAgo: "Yesterday",
    content: "The quietest part of the day is when I feel most like myself. The rest of the time I'm just performing for an audience that doesn't exist.",
    resonances: 215,
    isLiked: false
  },
  {
    id: '5',
    avatar: { shape: 'diamond', color: '#5dcaa5' },
    username: "Drifting Diamond",
    timeAgo: "2 days ago",
    content: "I kept the voicemail you left by accident. Just hearing someone say my name makes the apartment feel less empty.",
    resonances: 34,
    isLiked: false
  },
  {
    id: '6',
    avatar: { shape: 'circle', color: '#1c1b1f' },
    username: "Midnight Circle",
    timeAgo: "3 days ago",
    content: "We stopped talking a year ago, but I still check if you're online when I can't sleep.",
    resonances: 512,
    isLiked: true
  }
];

export const MOCK_MATCHES: MatchProfile[] = [
  {
    id: 'm1',
    avatar: { shape: 'triangle', color: '#3b309e' },
    username: "Wandering Triangle",
    matchedVia: "Shared unspoken regrets about lost connections",
    harmonyPercent: 92,
    excerpt: "I also kept the voicemails. I thought I was the only one...",
    sharedAgo: "2 hours ago"
  },
  {
    id: 'm2',
    avatar: { shape: 'circle', color: '#006c52' },
    username: "Quiet Circle",
    matchedVia: "Mutual anxiety about unexpected career shifts",
    harmonyPercent: 84,
    excerpt: "The truth is, my parents still think I'm at the firm.",
    sharedAgo: "Yesterday"
  },
  {
    id: 'm3',
    avatar: { shape: 'diamond', color: '#534ab7' },
    username: "Fragmented Diamond",
    matchedVia: "Shared feeling of performing for an audience",
    harmonyPercent: 79,
    excerpt: "Every day feels like a rehearsal for a play that got canceled.",
    sharedAgo: "3 days ago"
  },
  {
    id: 'm4',
    avatar: { shape: 'hexagon', color: '#5dcaa5' },
    username: "Lost Hexagon",
    matchedVia: "Lingering attachments to old places",
    harmonyPercent: 71,
    excerpt: "I still go to that coffee shop hoping they might walk in.",
    sharedAgo: "1 week ago"
  }
];
