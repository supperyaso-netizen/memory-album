// src/components/BirthdayIntro.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function BirthdayIntro({ onComplete }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [letterIndex, setLetterIndex] = useState(0);
  const [canSkip, setCanSkip] = useState(false); // Skip button 2 seconds க்கு பிறகு show ஆகும்
  const [hasSkipped, setHasSkipped] = useState(false);
  
  const timersRef = useRef([]);
  const skipTimerRef = useRef(null);

  const nameText = "Bala Bharathi";
  
  const loadingSteps = [
    { icon: "📸", text: "Collecting Photos...", progress: 20 },
    { icon: "🎥", text: "Collecting Videos...", progress: 40 },
    { icon: "💬", text: "Collecting Chats...", progress: 60 },
    { icon: "📞", text: "Collecting Calls...", progress: 80 },
    { icon: "❤️", text: "Collecting Memories...", progress: 100 },
  ];

  // Clear all timers
  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
  };

  // Screen tap or click - Skip intro
  const handleScreenTap = () => {
    if (canSkip && !isLoading && !hasSkipped && step < 8) {
      console.log("Skipping intro via tap...");
      setHasSkipped(true);
      clearAllTimers();
      setStep(8);
      setShowButton(true);
      setLetterIndex(nameText.length);
    }
  };

  useEffect(() => {
    console.log("BirthdayIntro mounted, starting sequence...");
    
    // Skip button 2 seconds க்கு பிறகு show ஆகும்
    skipTimerRef.current = setTimeout(() => {
      setCanSkip(true);
      console.log("Skip button enabled after 2 seconds");
    }, 2000);

    // SLOWER TIMINGS for better readability
    const timers = [
      setTimeout(() => { if (!hasSkipped) setStep(1); }, 1500),
      setTimeout(() => { if (!hasSkipped) setStep(2); }, 4000),
      setTimeout(() => { if (!hasSkipped) setStep(3); }, 7000),
      setTimeout(() => { if (!hasSkipped) setStep(4); }, 9000),
      setTimeout(() => { if (!hasSkipped) setStep(5); }, 11500),
      setTimeout(() => { if (!hasSkipped) setStep(6); }, 14000),
      setTimeout(() => { if (!hasSkipped) setStep(7); }, 17000),
      setTimeout(() => { if (!hasSkipped) setStep(8); }, 21000),
      setTimeout(() => { if (!hasSkipped) setShowButton(true); }, 26000),
    ];
    
    timersRef.current = timers;

    return () => {
      clearAllTimers();
    };
  }, [hasSkipped]);

  // Letter by letter animation - slower for dramatic effect
  useEffect(() => {
    if (step === 7 && !hasSkipped) {
      let interval;
      // Small delay before starting letter animation
      const startTimer = setTimeout(() => {
        interval = setInterval(() => {
          setLetterIndex((prev) => {
            if (prev >= nameText.length) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 120);
      }, 500);
      
      return () => {
        clearTimeout(startTimer);
        if (interval) clearInterval(interval);
      };
    }
  }, [step, nameText.length, hasSkipped]);

  // Loading animation
  useEffect(() => {
    if (isLoading && loadingStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLoadingStep((prev) => prev + 1);
        setProgress(loadingSteps[loadingStep]?.progress || 100);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingStep, loadingSteps]);

  const handleOpenStory = () => {
    setIsLoading(true);
  };

  useEffect(() => {
    if (isLoading && loadingStep === loadingSteps.length) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingStep, loadingSteps.length, onComplete]);

  const particles = [...Array(80)].map((_, i) => ({ 
    id: i, 
    left: Math.random() * 100, 
    delay: Math.random() * 5, 
    duration: 3 + Math.random() * 5,
    size: 1 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.3
  }));

  const glowParticles = [...Array(30)].map((_, i) => ({ 
    id: i, 
    left: Math.random() * 100, 
    delay: Math.random() * 8, 
    duration: 5 + Math.random() * 5 
  }));

  const heartParticles = [...Array(25)].map((_, i) => ({ 
    id: i, 
    left: Math.random() * 100, 
    delay: i * 0.25, 
    duration: 3.5 + Math.random() * 2.5 
  }));

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] overflow-hidden"
      onClick={handleScreenTap}  // Screen tap பண்ணினால் skip ஆகும்
    >
      {!isLoading ? (
        // INTRO SEQUENCE
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Modern Gradient Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-rose-500/5 to-amber-500/5 rounded-full blur-3xl" />
          </div>

          {/* Skip Button - 2 seconds க்கு பிறகுதான் show ஆகும் */}
          {canSkip && !showButton && step < 8 && !hasSkipped && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent screen tap from firing twice
                handleScreenTap();
              }}
              className="absolute top-8 right-8 z-20 px-5 py-2 text-xs tracking-wider text-white/40 hover:text-white/70 transition-all duration-300 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 font-light"
            >
              Skip →
            </motion.button>
          )}

          {/* Glowing Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {glowParticles.map((particle) => (
              <motion.div
                key={`glow-${particle.id}`}
                className="absolute w-1 h-1 bg-rose-400/30 rounded-full"
                initial={{ left: `${particle.left}%`, top: "100%", opacity: 0 }}
                animate={{ top: "-10%", opacity: [0, 0.6, 0] }}
                transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: "linear" }}
              />
            ))}
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: `radial-gradient(circle, rgba(244,63,94,${particle.opacity}), transparent)`,
                  left: `${particle.left}%`,
                }}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "-10%", opacity: [0, particle.opacity, 0] }}
                transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: "linear" }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 w-full max-w-2xl px-8 text-center">
            {/* Line 1 */}
            {step === 1 && !hasSkipped && (
              <motion.div
                key="line1"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-6"
              >
                <p className="text-white/60 text-xl md:text-2xl font-light tracking-wide">
                  In a universe of billions of people...
                </p>
              </motion.div>
            )}

            {/* Line 2 */}
            {step === 2 && !hasSkipped && (
              <motion.div
                key="line2"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <p className="text-white text-2xl md:text-3xl font-light tracking-wide leading-relaxed">
                  I never expected to find
                  <br />
                  someone like you.
                </p>
              </motion.div>
            )}

            {/* Line 3 */}
            {step === 3 && !hasSkipped && (
              <motion.div
                key="line3"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <p className="text-white/50 text-xl md:text-2xl font-light italic tracking-wide">
                  But somehow...
                </p>
              </motion.div>
            )}

            {/* Line 4 - The big reveal */}
            {step === 4 && !hasSkipped && (
              <motion.div
                key="line4"
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <p className="text-4xl md:text-5xl font-light tracking-wide">
                  there you were 
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block ml-2 text-rose-400"
                  >
                    ❤️
                  </motion.span>
                </p>
              </motion.div>
            )}

            {/* Line 5 */}
            {step === 5 && !hasSkipped && (
              <motion.div
                key="line5"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <p className="text-white/60 text-xl md:text-2xl font-light tracking-wide">
                  And every day since then...
                </p>
              </motion.div>
            )}

            {/* Line 6 */}
            {step === 6 && !hasSkipped && (
              <motion.div
                key="line6"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <p className="text-2xl md:text-3xl font-light tracking-wide">
                  has been my favorite chapter 
                  <span className="text-rose-400 ml-2">❤️</span>
                </p>
              </motion.div>
            )}

            {/* Date - Glowing */}
            {step === 7 && !hasSkipped && (
              <motion.div
                key="date"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                <motion.div
                  animate={{ 
                    textShadow: [
                      "0 0 20px rgba(244,63,94,0)",
                      "0 0 40px rgba(244,63,94,0.4)",
                      "0 0 60px rgba(244,63,94,0.6)",
                      "0 0 40px rgba(244,63,94,0.4)",
                      "0 0 20px rgba(244,63,94,0)",
                    ],
                    scale: [1, 1.03, 1],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-5xl md:text-6xl tracking-wider font-light bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400 bg-clip-text text-transparent"
                >
                  30 September
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto"
                >
                  <span className="text-rose-400/30 text-2xl">❤️</span>
                </motion.div>
              </motion.div>
            )}

            {/* Birthday Reveal - shows both normally and after skip */}
            {(step === 8 || hasSkipped) && (
              <motion.div
                key="birthday"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-white/50 text-sm tracking-[0.3em] font-light uppercase"
                  >
                    Today is your day
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
                    </div>
                    <p className="relative z-10 text-rose-400/60 text-sm tracking-[0.3em] font-light bg-black/50 inline-block px-4 py-1 rounded-full">
                      🎂 HAPPY BIRTHDAY 🎂
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="mt-8"
                  >
                    <p className="text-5xl md:text-7xl font-light tracking-wide bg-gradient-to-r from-white via-rose-200 to-white bg-clip-text text-transparent">
                      {nameText.slice(0, hasSkipped ? nameText.length : letterIndex)}
                      {!hasSkipped && letterIndex < nameText.length && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="text-white/50 font-light"
                        >
                          |
                        </motion.span>
                      )}
                    </p>
                  </motion.div>
                </div>

                {/* Floating hearts */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {heartParticles.map((heart) => (
                    <motion.div
                      key={`heart-${heart.id}`}
                      className="absolute text-2xl"
                      initial={{
                        left: `${heart.left}%`,
                        top: "100%",
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        top: "-10%",
                        opacity: [0, 0.4, 0],
                        scale: [0, 1, 0.5],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: heart.duration,
                        repeat: Infinity,
                        delay: heart.delay,
                        ease: "easeOut",
                      }}
                    >
                      {["❤️", "💕", "💖", "💗", "💓"][heart.id % 5]}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Button */}
            {(showButton || hasSkipped) && step >= 8 && (
              <motion.div
                key="button"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: hasSkipped ? 0 : 0.5 }}
                className="mt-12 space-y-6"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: hasSkipped ? 0.2 : 0.8 }}
                  className="text-white/40 text-sm tracking-wide font-light"
                >
                  I made something for you...
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: hasSkipped ? 0.4 : 1.1 }}
                  className="text-white/50 text-base font-light italic"
                >
                  A place where our memories live forever
                </motion.p>

                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: hasSkipped ? 0.6 : 1.4, type: "spring", stiffness: 200 }}
                  onClick={handleOpenStory}
                  className="group relative px-10 py-4 rounded-full overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-rose-600/20 backdrop-blur-sm border border-rose-500/30 rounded-full group-hover:border-rose-400/60 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-rose-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 text-white tracking-wide text-sm font-light flex items-center gap-2">
                    Open Our Story
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-rose-400"
                    >
                      ❤️
                    </motion.span>
                  </span>
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Bottom Gradient Line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
        </div>
      ) : (
        // LOADING SCREEN
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-[#0a0a0a] to-[#050505]">
          <div className="relative z-10 w-[320px] p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="space-y-5">
              {loadingSteps.map((stepItem, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: loadingStep > idx ? 1 : 0.4,
                    x: 0,
                  }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl">{stepItem.icon}</span>
                  <span
                    className={`flex-1 text-sm tracking-wide font-light ${
                      loadingStep > idx ? "text-white" : "text-white/30"
                    }`}
                  >
                    {stepItem.text}
                  </span>
                  {loadingStep > idx && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-rose-400 text-lg"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-600"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <p className="text-right text-xs text-white/30 mt-2 tracking-wide font-mono">
              {progress}%
            </p>
          </div>

          {loadingStep === loadingSteps.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <p className="text-white/60 text-sm tracking-wide font-light flex items-center gap-2 justify-center">
                Memory Vault Ready
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-rose-400"
                >
                  ❤️
                </motion.span>
              </p>
            </motion.div>
          )}

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`load-particle-${i}`}
                className="absolute w-[2px] h-[2px] bg-rose-500/40 rounded-full"
                initial={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0,
                }}
                animate={{
                  y: [null, -80, -150],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}