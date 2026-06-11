import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Heart, Play, Pause, Phone, Clock, 
  Star, Volume2, VolumeX, Music, Zap, User, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Audio Seek Bar with full control
const AudioSeekBar = ({ currentTime, duration, onSeek }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  
  const percentage = duration > 0 ? ((isDragging ? seekValue : currentTime) / duration) * 100 : 0;
  
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newTime = percentage * duration;
    onSeek(newTime);
  };
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newTime = percentage * duration;
    setSeekValue(newTime);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, x / width));
      const newTime = percentage * duration;
      setSeekValue(newTime);
    }
  };
  
  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      onSeek(seekValue);
    }
  };
  
  useEffect(() => {
    if (!isDragging) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isDragging]);
  
  return (
    <div className="w-full space-y-2">
      <div 
        className="relative h-2 bg-rose-500/20 rounded-full cursor-pointer group"
        onClick={handleSeek}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="absolute h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
};

// Simple animated waveform
const AudioWaveform = ({ isPlaying }) => {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-gradient-to-t from-rose-400 to-rose-600 rounded-full"
          animate={{
            height: isPlaying ? [4, 20, 4] : 4,
            opacity: isPlaying ? [0.5, 1, 0.5] : 0.3
          }}
          transition={{
            duration: 0.4,
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.02,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const CallCard = ({ call, isPlaying, onPlay, onPause }) => {
  const audioRef = useRef(null);
  const [audioError, setAudioError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };
    const handleEnded = () => onPause();
    const handleLoadedData = () => {
      setIsLoading(false);
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    const handleError = (e) => {
      console.error("Audio error:", e);
      setAudioError(true);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !audioError) {
      audio.play().catch(error => {
        console.error("Audio play error:", error);
        setAudioError(true);
        onPause();
      });
    } else if (!isPlaying) {
      audio.pause();
    }
  }, [isPlaying, audioError, onPause]);

  const handlePlay = () => {
    setAudioError(false);
    onPlay();
  };

  const handleSeek = (time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Validate audio URL - Check if it's a valid blob URL or file URL
  const isValidAudioUrl = call.audioUrl && call.audioUrl !== '' && 
    (call.audioUrl.startsWith('blob:') || call.audioUrl.startsWith('http') || call.audioUrl.startsWith('/'));

  // Format display date
  const displayDate = call.date ? new Date(call.date).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }) : 'Date not set';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-5 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <div className="relative z-10">
        {/* Header - Caller Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                call.isFavorite 
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-lg shadow-rose-500/30'
                  : 'bg-rose-500/20'
              }`}>
                <Phone className={`w-5 h-5 ${call.isFavorite ? 'text-white' : 'text-rose-400'}`} />
              </div>
              {isPlaying && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {call.name || 'Bala Bharathi'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-rose-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{displayDate}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{call.time || '--:--'}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400/60 text-xs">
                  <Music className="w-3 h-3" />
                  <span>{call.durationFormatted || formatDuration(call.duration)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {call.isFavorite && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-rose-500 to-amber-500 px-2 py-1 rounded-full"
            >
              <Star className="w-3 h-3 text-white fill-white" />
            </motion.div>
          )}
        </div>
        
        {/* No Audio File Message */}
        {!isValidAudioUrl && (
          <div className="mb-3 text-amber-400 text-xs bg-amber-500/10 p-2 rounded-lg">
            📞 Call recording file missing. Please add audio file in Admin Panel.
          </div>
        )}
        
        {/* Error Message */}
        {audioError && isValidAudioUrl && (
          <div className="mb-3 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg">
            ⚠️ Unable to play audio. The file might be corrupted or in unsupported format.
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && isValidAudioUrl && !audioError && (
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        
        {/* Seek Bar */}
        {isValidAudioUrl && !audioError && duration > 0 && (
          <div className="mb-4">
            <AudioSeekBar 
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <AudioWaveform isPlaying={isPlaying && !isLoading && isValidAudioUrl} />
          </div>
          
          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? onPause : handlePlay}
            disabled={!isValidAudioUrl || audioError}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlaying 
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30'
                : 'bg-gradient-to-r from-rose-500/80 to-rose-600/80 hover:shadow-lg hover:shadow-rose-500/30'
            } ${(!isValidAudioUrl || audioError) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </motion.button>
          
          {/* Volume Controls */}
          {isValidAudioUrl && !audioError && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500/40 flex items-center justify-center transition"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-rose-400" />
                )}
              </motion.button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-24 h-1 bg-rose-500/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
              />
            </div>
          )}
          
          {/* Empty spacer when no audio */}
          {!isValidAudioUrl && <div className="w-24" />}
        </div>
        
        {/* Audio Element */}
        {isValidAudioUrl && (
          <audio 
            ref={audioRef} 
            src={call.audioUrl}
            preload="metadata"
          />
        )}
      </div>
    </motion.div>
  );
};

export default function CallsPage() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Load calls from localStorage
  useEffect(() => {
    loadCalls();
    
    // Listen for storage changes from admin panel
    const handleStorageChange = (e) => {
      if (e.key === 'admin_calls') {
        loadCalls();
        setRefreshKey(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const loadCalls = () => {
    const savedCalls = localStorage.getItem('admin_calls');
    console.log("Loading calls from localStorage:", savedCalls);
    
    if (savedCalls) {
      try {
        let callsData = JSON.parse(savedCalls);
        // Filter out invalid entries and sort by date (newest first)
        callsData = callsData.filter(call => call && call.id);
        const sorted = callsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log("Loaded calls:", sorted);
        setCalls(sorted);
      } catch (error) {
        console.error("Error parsing calls:", error);
        setCalls([]);
      }
    } else {
      console.log("No calls found in localStorage");
      setCalls([]);
    }
  };
  
  const filteredCalls = showFavoritesOnly 
    ? calls.filter(call => call.isFavorite)
    : calls;
  
  const handlePlay = (id) => {
    // Stop any currently playing audio
    if (playingId && playingId !== id) {
      setPlayingId(null);
      // Small delay to allow cleanup
      setTimeout(() => setPlayingId(id), 100);
    } else {
      setPlayingId(id);
    }
  };
  
  const handlePause = () => {
    setPlayingId(null);
  };
  
  const totalCalls = calls.length;
  const favoriteCalls = calls.filter(c => c.isFavorite).length;
  const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
  
  if (calls.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="fixed inset-0 bg-gradient-to-br from-rose-950/20 via-black to-black pointer-events-none" />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <button
            onClick={() => navigate('/')}
            className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
          >
            <ArrowLeft className="w-6 h-6 text-rose-400" />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-full flex items-center justify-center">
                <Phone className="w-16 h-16 text-rose-400 opacity-50" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Calls Yet</h2>
            <p className="text-gray-400 mb-4">Your special conversations will appear here</p>
            <p className="text-rose-400 text-sm">Add call recordings from Admin Panel 📞</p>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-rose-950/10 via-black to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-rose-500/20">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 transition mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
                  Call Memories
                </h1>
                <p className="text-gray-400 mt-1">Every conversation, every laugh, every moment 📞</p>
              </div>
              
              {calls.length > 0 && (
                <div className="flex gap-3">
                  <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-500/20">
                    <p className="text-rose-400 text-xs">Total Calls</p>
                    <p className="text-white text-xl font-bold">{totalCalls}</p>
                  </div>
                  <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-500/20">
                    <p className="text-rose-400 text-xs">Favorites</p>
                    <p className="text-white text-xl font-bold">{favoriteCalls}</p>
                  </div>
                  <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-500/20">
                    <p className="text-rose-400 text-xs">Total Hours</p>
                    <p className="text-white text-xl font-bold">{Math.floor(totalDuration / 3600)}h</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6">
          {/* Favorite Filter Toggle */}
          {calls.length > 0 && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  showFavoritesOnly 
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-black/50 border border-rose-500/30 text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
              </button>
            </div>
          )}
          
          {/* Results Count */}
          {filteredCalls.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm">
                {filteredCalls.length} {filteredCalls.length === 1 ? 'call' : 'calls'} found
              </p>
            </div>
          )}
          
          {/* Calls List */}
          {filteredCalls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-full flex items-center justify-center">
                  <Heart className="w-16 h-16 text-rose-400 opacity-50" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {showFavoritesOnly ? 'No Favorite Calls Yet' : 'No Calls Yet'}
              </h2>
              <p className="text-gray-400">
                {showFavoritesOnly 
                  ? 'Mark some calls as favorites to see them here ❤️' 
                  : 'Your special conversations will appear here 📞'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredCalls.map((call) => (
                  <CallCard
                    key={`${call.id}-${refreshKey}`}
                    call={call}
                    isPlaying={playingId === call.id}
                    onPlay={() => handlePlay(call.id)}
                    onPause={handlePause}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}