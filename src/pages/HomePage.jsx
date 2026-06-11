// src/pages/HomePage.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Heart, 
  Mail, 
  Image, 
  Video, 
  MessageCircle, 
  Phone, 
  Lock, 
  Calendar,
  Sparkles,
  Star,
  Gift,
  Music,
  Camera,
  Coffee,
  Moon,
  Sun,
  ArrowRight
} from 'lucide-react';

// Relationship Timer Component
const RelationshipTimer = () => {
  const startDate = new Date('2026-03-22T11:18:00');
  const [timeElapsed, setTimeElapsed] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTime = () => {
      const now = new Date();
      const diff = now - startDate;
      
      if (diff < 0) {
        setTimeElapsed({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeElapsed({ years, months, days, hours, minutes, seconds });
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const timeUnits = [
    { key: 'years', label: 'Years', icon: Star },
    { key: 'months', label: 'Months', icon: Calendar },
    { key: 'days', label: 'Days', icon: Sun },
    { key: 'hours', label: 'Hours', icon: Coffee },
    { key: 'minutes', label: 'Minutes', icon: Heart },
    { key: 'seconds', label: 'Seconds', icon: Sparkles },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/30 via-black/60 to-black/80 backdrop-blur-sm border border-rose-500/20 shadow-2xl"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 pointer-events-none" />
      
      <div className="relative p-6">
        <div className="text-center space-y-4">
          {/* Title Section */}
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400/50" />
            </motion.div>
            <span className="text-rose-400/80 text-xs uppercase tracking-[0.2em] font-light">
              Every Moment Counts
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400/50" />
            </motion.div>
          </div>

          {/* Start Date */}
          <div className="text-center">
            <p className="text-rose-300/60 text-xs tracking-wide font-light">
             March 22, 2026 · 11:18 AM
            </p>
          </div>

          {/* Timer Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {timeUnits.map(({ key, label, icon: Icon }) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-rose-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-rose-500/20 group-hover:border-rose-500/40 transition-all duration-300">
                  <Icon className="w-4 h-4 text-rose-400/60 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-light text-rose-400 tabular-nums">
                    {String(timeElapsed[key] || 0).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">
                    {label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Love Quote */}
          <div className="pt-2">
            <p className="text-white/30 text-xs italic tracking-wide">
              "Every second with you is a treasure I'll keep forever"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Navigation Card Component
const NavigationCard = ({ to, icon: Icon, title, description, locked = false, comingSoon = false, color = 'rose' }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (comingSoon) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/30 to-black/60 p-6 backdrop-blur-sm border border-white/5 cursor-not-allowed opacity-60"
      >
        <div className="absolute top-3 right-3">
          <Lock className="w-5 h-5 text-white/30" />
        </div>
        <Icon className="w-10 h-10 text-white/30 mb-4" />
        <h3 className="text-xl font-light text-white/50 mb-2">{title}</h3>
        <p className="text-white/20 text-sm">{description}</p>
        <div className="mt-4 text-xs text-white/20 uppercase tracking-wider">Coming Soon</div>
      </motion.div>
    );
  }

  return (
    <Link to={to}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/20 via-black/50 to-black/80 p-6 backdrop-blur-sm border border-rose-500/20 cursor-pointer group transition-all duration-300 hover:border-rose-500/40"
      >
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0"
          animate={{ x: isHovered ? ['-100%', '100%'] : '-100%' }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Lock Icon */}
        {locked && (
          <div className="absolute top-3 right-3">
            <Lock className="w-4 h-4 text-rose-400/50" />
          </div>
        )}
        
        {/* Icon with Animation */}
        <motion.div
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-10 h-10 text-rose-400 mb-4" />
        </motion.div>
        
        {/* Title */}
        <h3 className="text-xl font-light text-white mb-2 tracking-wide">
          {title}
          {!locked && !comingSoon && (
            <span className="inline-block ml-2 text-rose-400/50 text-sm group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          )}
        </h3>
        
        {/* Description */}
        <p className="text-white/40 text-sm font-light leading-relaxed">
          {description}
        </p>
        
        {/* Bottom Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
      </motion.div>
    </Link>
  );
};

// Greeting Component
const GreetingSection = () => {
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    ;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-center mb-8"
    >
      <p className="text-white/40 text-sm tracking-wide mb-2">{date}</p>
      <h2 className="text-2xl md:text-3xl font-light text-white/80">
        {greeting}, <span className="text-rose-400">Darling 🎀</span>
      </h2>
    </motion.div>
  );
};

// Main HomePage Component
export default function HomePage() {
  const [showSecretMessage, setShowSecretMessage] = useState(false);

  const navigationItems = [
    { 
      to: "/love-letter", 
      icon: Mail, 
      title: "Love Letter", 
      description: "A special message just for you ❤️", 
      locked: true
    },
    { 
      to: "/special-memories", 
      icon: Calendar, 
      title: "Special Memories", 
      description: "Our most precious moments, captured forever 📸", 
      locked: false 
    },
    { 
      to: "/secret-video", 
      icon: Lock, 
      title: "Secret Video", 
      description: "Something special that I made only for you 🎥", 
      locked: true 
    },
    { 
      to: "/photos", 
      icon: Image, 
      title: "Photos", 
      description: "Every picture tells our beautiful story 💕", 
      locked: false 
    },
    { 
      to: "/videos", 
      icon: Video, 
      title: "Videos", 
      description: "Moving memories that bring smiles 🎬", 
      locked: false 
    },
    { 
      to: "/chats", 
      icon: MessageCircle, 
      title: "Chats", 
      description: "All our conversations, every 'hmm' and '😂' 💬", 
      locked: false 
    },
    { 
      to: "/calls", 
      icon: Phone, 
      title: "Calls", 
      description: "The voice that makes everything better 📞", 
      locked: false
    },
  ];

  // Count unlocked items
  const unlockedCount = navigationItems.filter(item => !item.locked && !item.comingSoon).length;
  const totalCount = navigationItems.length;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0">
        {/* Primary Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/10 via-black to-black pointer-events-none" />
        
        {/* Animated Grain */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjMiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjZikiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] bg-repeat opacity-30" />
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pb-24 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 ">
            <Heart className="w-3 h-3 text-rose-400" />
            <span className="text-white/40 text-xs tracking-[0.2em] font-light">YASO   -   BALA
            </span>
            <Heart className="w-3 h-3 text-rose-400" />
          </div>
          



          <h1 className="text-5xl md:text-7xl font-light tracking-wide mb-3">
            <span className="bg-gradient-to-r from-white via-rose-200 to-white bg-clip-text text-transparent">
              Our Memory Album
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-rose-500/30" />
            <span className="text-rose-400/60 text-sm tracking-wide font-light">Since 2025</span>
            <div className="w-8 h-px bg-rose-500/30" />
          </div>
        </motion.div>

        {/* Greeting */}
        <GreetingSection />

        {/* Relationship Timer */}
        <div className="mb-12">
          <RelationshipTimer />
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-8 px-4 py-3 rounded-xl bg-white/5 border border-white/5"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-white/30 text-xs tracking-wide">MEMORY VAULT</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-xs">{unlockedCount}/{totalCount} unlocked</span>
            <div className="w-16 h-[1px] bg-white/10">
              <div className="h-full bg-rose-500/50" style={{ width: `${(unlockedCount / totalCount) * 100}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <NavigationCard {...item} />
            </motion.div>
          ))}
        </div>

        {/* Secret Message Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => setShowSecretMessage(!showSecretMessage)}
            className="group relative px-6 py-2 rounded-full bg-transparent border border-white/10 hover:border-rose-500/30 transition-all duration-300"
          >
            <span className="text-white/30 text-xs tracking-wide group-hover:text-white/50 transition-colors">
              {showSecretMessage ? 'Hide Secret' : 'Find a Secret 🔑'}
            </span>
          </button>
          
          {showSecretMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-rose-950/20 border border-rose-500/20"
            >
              <p className="text-white/50 text-sm font-light italic">
                "Every day with you feels like a beautiful dream. I love you more than words can say. 💕"
              </p>
              <p className="text-rose-400/40 text-xs mt-2 tracking-wide">— Your Yaso 🥷🏼</p>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-16 pt-8 border-t border-white/5"
        >
          <div className="flex items-center justify-center gap-4 text-white/20 text-xs tracking-wide">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-rose-400/50 fill-rose-400/50" />
            <span>for you, Darling 🎀</span>
          </div>
          <p className="text-white/10 text-[10px] tracking-wider mt-3">
            EVERY MOMENT • EVERY MEMORY • FOREVER
          </p>
        </motion.div>
      </div>
    </div>
  );
}


