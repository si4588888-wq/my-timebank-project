import { AffiliateRecommendation, AffiliateClickEvent } from '../types';
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const AFFILIATE_CLICKS_STORAGE_KEY = 'skillbank_affiliate_clicks_v1';

// Rich Curated Affiliate Catalog tailored to community skills
export const AFFILIATE_CATALOG: AffiliateRecommendation[] = [
  // Technology
  {
    id: 'aff_rust_udemy',
    title: 'Rust Programming Complete Beginner to Expert Masterclass',
    provider: 'Udemy',
    category: 'Technology',
    matchingSkills: ['Rust', 'Systems Programming', 'Async Rust', 'C++', 'Backend'],
    description: 'Comprehensive hands-on guide to ownership, concurrency, memory safety, and production async services.',
    rating: 4.8,
    reviewCount: 14200,
    priceDisplay: '$14.99',
    badge: 'Bestseller',
    affiliateUrl: 'https://www.udemy.com/course/rust-programming-masterclass/?partner=skillbank_ref',
    commissionNotice: 'SkillBank Partner Earns 15% Comm.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'aff_react_coursera',
    title: 'Full-Stack Web Development with React Specialization',
    provider: 'Coursera',
    category: 'Technology',
    matchingSkills: ['React', 'TypeScript', 'JavaScript', 'Web Development', 'Frontend'],
    description: 'Professional certificate covering React hooks, state machines, server components, and Tailwind integration.',
    rating: 4.9,
    reviewCount: 28400,
    priceDisplay: 'Financial Aid Available',
    badge: 'Top Rated',
    affiliateUrl: 'https://www.coursera.org/specializations/full-stack-react?partner=skillbank_ref',
    commissionNotice: 'SkillBank Partner Earns 20% Comm.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'aff_python_coursera',
    title: 'Python for Everybody & Data Structures Specialization',
    provider: 'Coursera',
    category: 'Technology',
    matchingSkills: ['Python', 'Data Analysis', 'Machine Learning', 'AI', 'Algorithms'],
    description: 'Master clean procedural code, API querying, databases, and scientific computing.',
    rating: 4.8,
    reviewCount: 95000,
    priceDisplay: 'Free Audit / $39/mo',
    badge: 'Most Enrolled',
    affiliateUrl: 'https://www.coursera.org/specializations/python?partner=skillbank_ref',
    commissionNotice: 'SkillBank Partner Earns 15% Comm.',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80',
  },

  // Culinary
  {
    id: 'aff_sourdough_kit',
    title: 'Artisan Sourdough Proofing Basket Banneton Kit & Scoring Lame',
    provider: 'Amazon Gear',
    category: 'Culinary',
    matchingSkills: ['Sourdough', 'Sourdough Baking', 'Bread', 'Artisan Bread', 'Baking', 'Fermentation'],
    description: 'Complete sourdough starter kit: 9-inch round rattan banneton, Danish dough whisk, metal scraper, and precision lame.',
    rating: 4.9,
    reviewCount: 8900,
    priceDisplay: '$29.95',
    badge: 'Essential Gear',
    affiliateUrl: 'https://www.amazon.com/dp/B08XYZBREAD?tag=skillbank-barter-20',
    commissionNotice: 'SkillBank Amazon Affiliate Link',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'aff_pasta_masterclass',
    title: 'Massimo Bottura Teaches Modern & Traditional Italian Cooking',
    provider: 'MasterClass',
    category: 'Culinary',
    matchingSkills: ['Italian', 'Pasta', 'Culinary Arts', 'Cooking', 'Sauces', 'Gastronomy'],
    description: 'World-renowned 3-Michelin-star chef teaches fresh pasta rolling, Emilia-Romagna ragù, and plating aesthetics.',
    rating: 4.9,
    reviewCount: 32000,
    priceDisplay: '$10/mo billed annually',
    badge: 'MasterClass Choice',
    affiliateUrl: 'https://www.masterclass.com/classes/massimo-bottura-teaches-modern-italian-cooking?partner=skillbank',
    commissionNotice: 'SkillBank Partner 25% Revenue Share',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&auto=format&fit=crop&q=80',
  },

  // Languages
  {
    id: 'aff_japanese_genki',
    title: 'GENKI I & II: Integrated Course in Elementary Japanese + Workbook',
    provider: 'Amazon Gear',
    category: 'Languages',
    matchingSkills: ['Japanese', 'JLPT', 'Kanji', 'Calligraphy', 'Asian Languages'],
    description: 'The standard textbook worldwide for Japanese grammar, situational dialogues, vocabulary, and hiragana/katakana drills.',
    rating: 4.9,
    reviewCount: 16500,
    priceDisplay: '$42.50',
    badge: 'Community Standard',
    affiliateUrl: 'https://www.amazon.com/dp/4789017303?tag=skillbank-barter-20',
    commissionNotice: 'SkillBank Amazon Affiliate Link',
    image: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'aff_spanish_udemy',
    title: 'Conversational Spanish Masterclass: Speak Like a Native in 30 Days',
    provider: 'Udemy',
    category: 'Languages',
    matchingSkills: ['Spanish', 'Conversational Spanish', 'Grammar', 'Romance Languages'],
    description: 'Immersive audio-visual lessons, interactive pronunciations, practical idioms, and real Latin American situational practice.',
    rating: 4.7,
    reviewCount: 19800,
    priceDisplay: '$16.99',
    badge: 'Top Seller',
    affiliateUrl: 'https://www.udemy.com/course/spanish-for-beginners-complete/?partner=skillbank_ref',
    commissionNotice: 'SkillBank Partner Earns 15% Comm.',
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&auto=format&fit=crop&q=80',
  },

  // Arts & Crafts / Ceramics
  {
    id: 'aff_pottery_wheel_kit',
    title: 'Pottery Clay Sculpting Tools & Wheel Starter Set (24-Piece)',
    provider: 'Amazon Gear',
    category: 'Arts & Crafts',
    matchingSkills: ['Ceramics', 'Pottery', 'Clay Sculpting', 'Wheel Throwing', 'Glazing'],
    description: 'High-grade stainless steel & hardwood modeling tools, loop cutters, sponge, wire cutter, and ribbon tools.',
    rating: 4.8,
    reviewCount: 4200,
    priceDisplay: '$22.99',
    badge: 'Top Pick',
    affiliateUrl: 'https://www.amazon.com/dp/B07XYZPOTTERY?tag=skillbank-barter-20',
    commissionNotice: 'SkillBank Amazon Affiliate Link',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80',
  },

  // Music
  {
    id: 'aff_music_production',
    title: 'Electronic Music Production & Audio Engineering in Ableton Live',
    provider: 'Skillshare',
    category: 'Music',
    matchingSkills: ['Music', 'Electronic Music', 'Ableton', 'Sound Design', 'Mixing', 'Audio Production'],
    description: 'Deep dive into synthesis, MIDI workflow, EQ, compression, and mastering your first EP.',
    rating: 4.9,
    reviewCount: 8700,
    priceDisplay: '1 Month Free Trial',
    badge: 'Skillshare Original',
    affiliateUrl: 'https://www.skillshare.com/classes/ableton-live-music-production?partner=skillbank',
    commissionNotice: 'SkillBank Referral Bounty $10',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
  },

  // Trades & DIY
  {
    id: 'aff_woodworking_chisels',
    title: 'Narex Premium Woodworking Chisel Set (6-Piece Bench Chisels)',
    provider: 'Amazon Gear',
    category: 'Trades & DIY',
    matchingSkills: ['Woodworking', 'Carpentry', 'Joinery', 'Cabinet Making', 'Chisels', 'DIY'],
    description: 'Drop forged chrome-manganese steel hardened to Rc 59 with stained hornbeam handles and brass ferrules.',
    rating: 4.9,
    reviewCount: 5600,
    priceDisplay: '$79.00',
    badge: 'Heirloom Quality',
    affiliateUrl: 'https://www.amazon.com/dp/B00XYZNAREX?tag=skillbank-barter-20',
    commissionNotice: 'SkillBank Amazon Affiliate Link',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&auto=format&fit=crop&q=80',
  },

  // Life & Wellness
  {
    id: 'aff_mindfulness_cert',
    title: 'Mindfulness & Compassion Practice Certification Specialization',
    provider: 'Coursera',
    category: 'Life & Wellness',
    matchingSkills: ['Mindfulness', 'Meditation', 'Yoga', 'Stress Management', 'Breathwork', 'Wellness'],
    description: 'Science-backed mindfulness techniques from Rice University neuroscientists and seasoned teachers.',
    rating: 4.9,
    reviewCount: 11200,
    priceDisplay: 'Free Audit / $49/mo',
    badge: 'University Verified',
    affiliateUrl: 'https://www.coursera.org/specializations/mindfulness?partner=skillbank_ref',
    commissionNotice: 'SkillBank Partner 20% Comm.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80',
  }
];

/**
 * Filter recommendations matching given skills list
 */
export function getRecommendationsForSkills(skills: string[], limitCount = 3): AffiliateRecommendation[] {
  if (!skills || skills.length === 0) {
    return AFFILIATE_CATALOG.slice(0, limitCount);
  }

  const normalizedSkills = skills.map((s) => s.toLowerCase().trim());

  // Score each item based on matching skills
  const scored = AFFILIATE_CATALOG.map((item) => {
    let score = 0;
    const itemSkills = item.matchingSkills.map((s) => s.toLowerCase());

    for (const skill of normalizedSkills) {
      for (const itemSkill of itemSkills) {
        if (itemSkill.includes(skill) || skill.includes(itemSkill)) {
          score += 3;
        }
      }
      if (item.title.toLowerCase().includes(skill)) {
        score += 2;
      }
      if (item.category.toLowerCase().includes(skill)) {
        score += 1;
      }
    }

    return { item, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.filter((s) => s.score > 0).map((s) => s.item);

  if (topMatches.length >= limitCount) {
    return topMatches.slice(0, limitCount);
  }

  // Backfill with high-rated items if not enough matches
  const ids = new Set(topMatches.map((i) => i.id));
  const fallback = AFFILIATE_CATALOG.filter((i) => !ids.has(i.id)).slice(0, limitCount - topMatches.length);

  return [...topMatches, ...fallback];
}

/**
 * Track an affiliate link click event
 */
export async function trackAffiliateClick(
  userId: string,
  recommendation: AffiliateRecommendation,
  location: 'profile_view' | 'chat_suggestion' | 'syllabus_generator'
): Promise<AffiliateClickEvent> {
  const clickEvent: AffiliateClickEvent = {
    id: `aff_click_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    affiliateId: recommendation.id,
    title: recommendation.title,
    provider: recommendation.provider,
    location,
    timestamp: new Date().toISOString(),
  };

  // 1. Save locally in localStorage for resilience
  try {
    const raw = localStorage.getItem(AFFILIATE_CLICKS_STORAGE_KEY);
    const list: AffiliateClickEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(clickEvent);
    // Keep max 100 recent clicks
    localStorage.setItem(AFFILIATE_CLICKS_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (err) {
    console.warn('Could not save affiliate click to localStorage:', err);
  }

  // 2. Dispatch window event for UI update/telemetry
  window.dispatchEvent(
    new CustomEvent('skillbank_affiliate_clicked', {
      detail: { clickEvent },
    })
  );

  // 3. Persist to Firestore if available
  if (db && isFirebaseConfigured) {
    try {
      const clickRef = doc(db, 'affiliate_clicks', clickEvent.id);
      await setDoc(clickRef, clickEvent);
    } catch (err) {
      console.warn('Firestore affiliate click sync notice (offline mode active):', err);
    }
  }

  return clickEvent;
}

/**
 * Retrieve aggregated affiliate click statistics
 */
export function getAffiliateClickStats(userId?: string): {
  totalClicks: number;
  recentClicks: AffiliateClickEvent[];
  clicksByProvider: Record<string, number>;
  clicksByLocation: Record<string, number>;
} {
  try {
    const raw = localStorage.getItem(AFFILIATE_CLICKS_STORAGE_KEY);
    let list: AffiliateClickEvent[] = raw ? JSON.parse(raw) : [];

    if (userId) {
      list = list.filter((c) => c.userId === userId);
    }

    const clicksByProvider: Record<string, number> = {};
    const clicksByLocation: Record<string, number> = {};

    list.forEach((c) => {
      clicksByProvider[c.provider] = (clicksByProvider[c.provider] || 0) + 1;
      clicksByLocation[c.location] = (clicksByLocation[c.location] || 0) + 1;
    });

    return {
      totalClicks: list.length,
      recentClicks: list.slice(0, 10),
      clicksByProvider,
      clicksByLocation,
    };
  } catch {
    return {
      totalClicks: 0,
      recentClicks: [],
      clicksByProvider: {},
      clicksByLocation: {},
    };
  }
}
