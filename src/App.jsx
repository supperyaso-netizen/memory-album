// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BirthdayIntro from './components/BirthdayIntro';

// Pages
import HomePage from './pages/HomePage';
import LoveLetterPage from './pages/LoveLetterPage';
import SpecialMemoriesPage from './pages/SpecialMemoriesPage';
import SecretVideoPage from './pages/SecretVideoPage';
import PhotosPage from './pages/PhotosPage';
import VideosPage from './pages/VideosPage';
import ChatsPage from './pages/ChatsPage';
import CallsPage from './pages/CallsPage';
import AdminPanel from './pages/AdminPanel';

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


 useEffect(() => {
  // FORCE RESET - Clear session storage on every refresh for testing
  sessionStorage.removeItem('birthdayIntroShown');  // ← ADD THIS LINE
  
  const introShown = sessionStorage.getItem('birthdayIntroShown');
  const today = new Date();
  const isBirthday = today.getMonth() === 8 && today.getDate() === 30;
  
  console.log("Today's date:", today);
  console.log("Is Birthday?", isBirthday);
  console.log("Intro shown before:", introShown);
  
  if (isBirthday && !introShown) {
    console.log("Setting showIntro to TRUE");
    setShowIntro(true);
  } else {
    console.log("NOT showing intro. isBirthday:", isBirthday, "introShown:", introShown);
  }
  
  setIsLoading(false);
}, []);


  const handleIntroComplete = () => {
    // Store in session storage (clears when browser tab closes)
    sessionStorage.setItem('birthdayIntroShown', 'true');
    setShowIntro(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  if (showIntro) {
    return <BirthdayIntro onComplete={handleIntroComplete} />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/love-letter" element={<PageTransition><LoveLetterPage /></PageTransition>} />
          <Route path="/special-memories" element={<PageTransition><SpecialMemoriesPage /></PageTransition>} />
          <Route path="/secret-video" element={<PageTransition><SecretVideoPage /></PageTransition>} />
          <Route path="/photos" element={<PageTransition><PhotosPage /></PageTransition>} />
          <Route path="/videos" element={<PageTransition><VideosPage /></PageTransition>} />
          <Route path="/chats" element={<PageTransition><ChatsPage /></PageTransition>} />
          <Route path="/calls" element={<PageTransition><CallsPage /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}



export default App;