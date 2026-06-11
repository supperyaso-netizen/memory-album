import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, Mail, Heart, Sparkles, Calendar, Check, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WrongAnswerMessage = ({ attempt, onClose }) => {
  const messages = [
    { text: "Memory Not Found ❌ Boyfriend Disappointed Level: 25% 😭❤️", emoji: "😭", level: "25%" },
    { text: "Suspicious Activity Detected 🤨 Indha memory unakku nyabagam illaya? ❤️", emoji: "🤨", level: "50%" },
    { text: "Emergency Alert 🚨 Girlfriend Memory System Offline 😭", emoji: "🚨", level: "75%" },
    { text: "⚠️ FINAL WARNING ⚠️\nLast chance before contacting Boyfriend support team! 😭 ", emoji: "📞", level: "100%" }
  ];
  
  const message = messages[Math.min(attempt - 1, messages.length - 1)];
  const isFinal = attempt >= 4;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div 
        className="bg-gradient-to-br from-red-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-red-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-7xl mb-4">{message.emoji}</div>
          <p className="text-red-300 text-lg whitespace-pre-line">{message.text}</p>
          
          {!isFinal && (
            <div className="mt-4">
              <div className="w-full bg-black/50 rounded-full h-2">
                <motion.div 
                  className="bg-red-500 rounded-full h-2"
                  initial={{ width: "0%" }}
                  animate={{ width: message.level }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-red-400 text-xs mt-2">Boyfriend Disappointment Level: {message.level}</p>
            </div>
          )}
          
          {isFinal && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t border-red-500/30"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Headphones className="w-5 h-5 text-rose-400" />
                <span className="text-rose-400 font-semibold">Contact Support</span>
              </div>
              <p className="text-gray-300 text-sm">📞 Call Boyfriend Support Team: <br/> 
              <span className="text-rose-400 font-mono">+91 9360875121</span></p>
             
            </motion.div>
          )}
          
          <button
            onClick={onClose}
            className="mt-6 bg-red-500/20 hover:bg-red-500/30 text-white px-6 py-2 rounded-lg transition text-sm"
          >
            {isFinal ? "I'll Remember Next Time 😢" : "Try Again ❤️"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CorrectAnswerMessage = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      onClick={onComplete}
    >
      <motion.div 
        className="bg-gradient-to-br from-green-950/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-green-500/30 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <div className="text-7xl mb-4">✅</div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-green-300 text-xl font-semibold"
        >
          Identity Verified ❤️
        </motion.p>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-rose-300 mt-2"
        >
          Welcome Back Darling 😘
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onComplete}
          className="mt-6 bg-gradient-to-r from-rose-500 to-rose-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition"
        >
          Open Letter 💌
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const LoveLetter = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-gradient-to-br from-rose-950/30 to-black/50 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-rose-500/30 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header with animated heart */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-16 h-16 text-rose-400 mx-auto mb-3 fill-rose-400/20" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-light tracking-wide bg-gradient-to-r from-rose-300 to-rose-500 bg-clip-text text-transparent">
            My Love Letter
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent mx-auto mt-3" />
        </div>
        
        {/* Letter content with better spacing and emojis */}
        <div className="space-y-6 text-gray-100 leading-loose tracking-wide">
          <p className="text-rose-300 text-xl font-light">Dear Darling ❤️,</p>
          
          <div className="bg-rose-500/5 rounded-xl p-4 md:p-5 border-l-4 border-rose-400">
            <p className="text-gray-100 text-base md:text-lg leading-relaxed">
              📝 Enakku love letter eludhura alavukku perusa pesa theriyadhu. 
              Aana unna pathi sollanum nu thonuchi.
            </p>
          </div>
          
          <div className="flex gap-2 justify-center my-4">
            <span className="text-2xl">💭</span>
            <span className="text-2xl">✨</span>
            <span className="text-2xl">💕</span>
          </div>
          
          <p className="text-gray-100 text-base md:text-lg leading-relaxed">
            🌸 Nee en life la vandhadhukku apram neraya vishayam maari pochu. 
            Daily un kooda pesuradhu, un message kaaga wait panradhu, 
            un sirippu pathu happy aaguradhu idhellam enakku oru habit aayiduchu.
          </p>
          
          <div className="bg-black/30 rounded-xl p-4 my-4 text-center">
            <p className="text-rose-300 text-sm md:text-base">
              💬 "Every message from you makes my day brighter"
            </p>
          </div>
          
          <p className="text-gray-100 text-base md:text-lg leading-relaxed">
            😊 Un smile enakku romba pidikkum. upset ah irundhaa adha paatha konjam happy ayiduven. 
            Adhe maari un eyes um romba azhaga irukkum. 👀 Naan sollama irundhaalum adha naan eppovume rasippen. ✨
          </p>
          
          <div className="flex gap-3 justify-center my-4">
            <span className="text-3xl animate-bounce">😊</span>
            <span className="text-3xl animate-pulse">👀</span>
            <span className="text-3xl animate-spin">✨</span>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-500/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-3 text-rose-400 text-xs tracking-wider">💝 MY PROMISE 💝</span>
            </div>
          </div>
          
          <p className="text-gray-100 text-base md:text-lg leading-relaxed">
            💖 Naan eppovume perfect ah irukka maatten. Sila neram thappa pesiruppen, kovapattiruppen. 
            Aana un mela irukkura love mattum eppayum korayaathu chelloo...
          </p>
          
          <div className="bg-gradient-to-r from-rose-500/10 to-transparent rounded-lg p-4 border-l-4 border-rose-400">
            <p className="text-rose-300 text-sm md:text-base italic">
              "I may not be perfect, but my love for you always will be"
            </p>
          </div>
          
          <p className="text-gray-100 text-base md:text-lg leading-relaxed text-center">
            🌹 Nee en kooda irukkuradhu dhaan enakku mukkiyam.<br/>
            Adha vida vera edhuvum perusu illa. 🌹
          </p>
          
          <div className="text-center pt-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              <Heart className="w-12 h-12 text-rose-400 mx-auto fill-rose-400/30" />
            </motion.div>
            <p className="text-rose-400 text-xl md:text-2xl mt-4 font-light tracking-wide">
              your Darling ❤️
            </p>
            <p className="text-rose-300/80 mt-2 text-base font-serif">
              Yaso
            </p>
          </div>
        </div>
        
        {/* Footer badge */}
        <div className="mt-8 pt-6 border-t border-rose-500/20 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-500/15 rounded-full px-5 py-2 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-rose-300 tracking-wide">Keeper Of My Heart ❤️</span>
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function LoveLetterPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorAttempt, setErrorAttempt] = useState(0);
  
  const correctAnswer = 'april 01';
  
  const dateOptions = [
    { value: 'march 22', label: 'March 22, 2026', emoji: '🌸' },
    { value: 'april 01', label: 'April 1, 2026', emoji: '💕' },
    { value: 'may 06', label: 'May 6, 2026', emoji: '✨' },
    { value: 'june 15', label: 'June 15, 2026', emoji: '💖' }
  ];
  
  const handleUnlock = () => {
    if (selectedDate === correctAnswer) {
      setShowSuccess(true);
      setShowError(false);
    } else {
      const newAttempt = errorAttempt + 1;
      setErrorAttempt(newAttempt);
      setShowError(true);
      
      // Auto close after 5 seconds (longer for final message)
      const delay = newAttempt >= 4 ? 6000 : 4000;
      setTimeout(() => {
        setShowError(false);
      }, delay);
    }
  };
  
  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setIsUnlocked(true);
  };
  
  if (isUnlocked) {
    return (
      <div className="min-h-screen bg-black p-4">
        <button
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
        >
          <ArrowLeft className="w-6 h-6 text-rose-400" />
        </button>
        <LoveLetter />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AnimatePresence>
        {showError && <WrongAnswerMessage attempt={errorAttempt} onClose={() => setShowError(false)} />}
        {showSuccess && <CorrectAnswerMessage onComplete={handleSuccessComplete} />}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-8 border border-rose-500/30"
      >
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Love Letter Locked 🔒</h2>
          <p className="text-gray-400">Choose the correct date to unlock my heart</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-rose-400 mb-3 text-center">
              When did we first touch? <br/>
              <span className="text-sm text-gray-500">(Our first meeting date)</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {dateOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(option.value)}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    selectedDate === option.value
                      ? 'bg-gradient-to-r from-rose-500 to-rose-700 border-rose-400 shadow-lg shadow-rose-500/30'
                      : 'bg-black/50 border border-rose-500/30 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-white font-medium">{option.label}</span>
                  </div>
                  {selectedDate === option.value && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleUnlock}
            disabled={!selectedDate}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unlock My Heart ❤️
          </button>
          
          <p className="text-center text-gray-500 text-xs">
            Hint: It's the day we first met! 💕
          </p>
        </div>
      </motion.div>
    </div>
  );
}