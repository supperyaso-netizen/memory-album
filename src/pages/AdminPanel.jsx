import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Lock, Plus, Image, Video, 
  Heart, Edit, Trash2, Save, X, Check,
  Film, Camera, Star, Phone, Mic, Upload,
  User, Calendar, Clock, Volume2, RefreshCw, Play, Pause,
  AlertCircle, FileWarning, Music
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('photos');
  
  // Main data states
  const [photos, setPhotos] = useState([]);
  const [specialMemories, setSpecialMemories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [calls, setCalls] = useState([]);
  
  // Edit mode states
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editingMemory, setEditingMemory] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingCall, setEditingCall] = useState(null);
  
  // Form states
  const [newPhoto, setNewPhoto] = useState({ file: null, caption: '', date: '' });
  const [newMemory, setNewMemory] = useState({ file: null, caption: '', date: '', thumbnail: null });
  const [newVideo, setNewVideo] = useState({ file: null, title: '', thumbnail: null, duration: '', date: '' });
  const [newCall, setNewCall] = useState({ file: null, duration: '', date: '', time: '', isFavorite: false, name: '' });
  
  // Preview states
  const [photoPreview, setPhotoPreview] = useState(null);
  const [memoryPreview, setMemoryPreview] = useState(null);
  const [memoryThumbnailPreview, setMemoryThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [callPreview, setCallPreview] = useState(null);
  
  // File size limits (in bytes)
  const FILE_SIZE_LIMITS = {
    photo: 5 * 1024 * 1024,    // 5MB
    video: 15 * 1024 * 1024,   // 15MB
    audio: 3 * 1024 * 1024,    // 3MB
    memory: 10 * 1024 * 1024   // 10MB
  };
  
  // Load all data from localStorage
  useEffect(() => {
    loadAllData();
  }, []);
  
  const loadAllData = () => {
    try {
      const savedPhotos = localStorage.getItem('admin_photos');
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      } else {
        setPhotos([]);
      }
      
      const savedMemories = localStorage.getItem('admin_special_memories');
      if (savedMemories) {
        setSpecialMemories(JSON.parse(savedMemories));
      } else {
        setSpecialMemories([]);
      }
      
      const savedVideos = localStorage.getItem('admin_videos');
      if (savedVideos) {
        setVideos(JSON.parse(savedVideos));
      } else {
        setVideos([]);
      }
      
      const savedCalls = localStorage.getItem('admin_calls');
      if (savedCalls) {
        setCalls(JSON.parse(savedCalls));
      } else {
        setCalls([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };
  
  const saveData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Dispatch storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', { key: key, newValue: JSON.stringify(data) }));
      window.dispatchEvent(new CustomEvent(`${key}Updated`));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert(`❌ Storage limit exceeded! Total size of all files in ${key} is too large. Please delete some items or use smaller files.`);
        return false;
      }
      throw error;
    }
  };
  
  // Helper: Convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Helper: Get file size in MB
  const getFileSizeMB = (file) => {
    return (file.size / (1024 * 1024)).toFixed(2);
  };
  
  // Helper: Get estimated localStorage usage
  const getStorageUsage = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2; // Approximate size in bytes
      }
    }
    return (total / (1024 * 1024)).toFixed(2);
  };
  
  // ==================== PHOTO MANAGEMENT ====================
  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > FILE_SIZE_LIMITS.photo) {
        alert(`❌ Photo is too large (${getFileSizeMB(file)}MB). Please use photos under 5MB.`);
        return;
      }
      setNewPhoto({ ...newPhoto, file: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };
  
  const handleAddPhoto = async () => {
    if (!newPhoto.file) {
      alert('⚠️ Please select a photo!');
      return;
    }
    if (!newPhoto.caption.trim()) {
      alert('⚠️ Please add a caption!');
      return;
    }
    
    try {
      const base64 = await fileToBase64(newPhoto.file);
      const photo = {
        id: Date.now(),
        url: base64,
        caption: newPhoto.caption,
        date: newPhoto.date || new Date().toLocaleDateString()
      };
      const updatedPhotos = [...photos, photo];
      setPhotos(updatedPhotos);
      const saved = saveData('admin_photos', updatedPhotos);
      if (!saved) return;
      
      // Reset form
      setNewPhoto({ file: null, caption: '', date: '' });
      setPhotoPreview(null);
      const fileInput = document.getElementById('photoFile');
      if (fileInput) fileInput.value = '';
      alert(`✅ Photo added! Storage usage: ${getStorageUsage()}MB / ~10MB`);
    } catch (error) {
      alert('Error adding photo: ' + error.message);
    }
  };
  
  const handleUpdatePhoto = () => {
    if (editingPhoto) {
      const updatedPhotos = photos.map(p => p.id === editingPhoto.id ? editingPhoto : p);
      setPhotos(updatedPhotos);
      saveData('admin_photos', updatedPhotos);
      setEditingPhoto(null);
      alert('✅ Photo updated!');
    }
  };
  
  const handleDeletePhoto = (id) => {
    if (confirm('Delete this photo permanently?')) {
      const updatedPhotos = photos.filter(p => p.id !== id);
      setPhotos(updatedPhotos);
      saveData('admin_photos', updatedPhotos);
      alert('✅ Photo deleted!');
    }
  };
  
  // ==================== SPECIAL MEMORIES MANAGEMENT ====================
  const handleMemoryFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type.startsWith('image/') && file.size > FILE_SIZE_LIMITS.photo) {
      alert(`❌ Image is too large (${getFileSizeMB(file)}MB). Please use images under 5MB.`);
      return;
    }
    if (file.type.startsWith('video/') && file.size > FILE_SIZE_LIMITS.memory) {
      alert(`❌ Video is too large (${getFileSizeMB(file)}MB). Please use videos under 10MB.`);
      return;
    }
    
    setNewMemory({ ...newMemory, file: file });
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setMemoryPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setMemoryPreview(URL.createObjectURL(file));
    }
  };
  
  const handleMemoryThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        alert('❌ Thumbnail should be under 2MB');
        return;
      }
      setNewMemory({ ...newMemory, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => setMemoryThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddMemory = async () => {
    if (!newMemory.file) {
      alert('⚠️ Please select a file!');
      return;
    }
    if (!newMemory.caption.trim()) {
      alert('⚠️ Please add a caption!');
      return;
    }
    
    try {
      const isVideo = newMemory.file.type.startsWith('video/');
      const base64 = await fileToBase64(newMemory.file);
      
      const memory = {
        id: Date.now(),
        url: base64,
        caption: newMemory.caption,
        date: newMemory.date || new Date().toLocaleDateString(),
        type: isVideo ? 'video' : 'image',
        thumbnail: memoryThumbnailPreview || null
      };
      const updatedMemories = [...specialMemories, memory];
      setSpecialMemories(updatedMemories);
      const saved = saveData('admin_special_memories', updatedMemories);
      if (!saved) return;
      
      // Reset form
      setNewMemory({ file: null, caption: '', date: '', thumbnail: null });
      setMemoryPreview(null);
      setMemoryThumbnailPreview(null);
      const fileInput = document.getElementById('memoryFile');
      const thumbInput = document.getElementById('memoryThumbnail');
      if (fileInput) fileInput.value = '';
      if (thumbInput) thumbInput.value = '';
      alert(`✅ Memory added! Storage usage: ${getStorageUsage()}MB / ~10MB`);
    } catch (error) {
      alert('Error adding memory: ' + error.message);
    }
  };
  
  const handleUpdateMemory = () => {
    if (editingMemory) {
      const updatedMemories = specialMemories.map(m => m.id === editingMemory.id ? editingMemory : m);
      setSpecialMemories(updatedMemories);
      saveData('admin_special_memories', updatedMemories);
      setEditingMemory(null);
      alert('✅ Memory updated!');
    }
  };
  
  const handleDeleteMemory = (id) => {
    if (confirm('Delete this special memory permanently?')) {
      const updatedMemories = specialMemories.filter(m => m.id !== id);
      setSpecialMemories(updatedMemories);
      saveData('admin_special_memories', updatedMemories);
      alert('✅ Memory deleted!');
    }
  };
  
  // ==================== VIDEO MANAGEMENT ====================
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > FILE_SIZE_LIMITS.video) {
        alert(`❌ Video is too large (${getFileSizeMB(file)}MB). Please use videos under 15MB.`);
        return;
      }
      setNewVideo({ ...newVideo, file: file });
      setVideoPreview(URL.createObjectURL(file));
    } else {
      alert('Please select a valid video file');
    }
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        alert('❌ Thumbnail should be under 2MB');
        return;
      }
      setNewVideo({ ...newVideo, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddVideo = async () => {
    if (!newVideo.file) {
      alert('⚠️ Please select a video!');
      return;
    }
    if (!newVideo.title.trim()) {
      alert('⚠️ Please add a title!');
      return;
    }
    
    try {
      const base64 = await fileToBase64(newVideo.file);
      const video = {
        id: Date.now(),
        videoUrl: base64,
        title: newVideo.title,
        thumbnail: thumbnailPreview || "https://images.unsplash.com/photo-1518199266791-5375a83190b5?w=400",
        duration: newVideo.duration || "0:00",
        date: newVideo.date || new Date().toLocaleDateString()
      };
      
      const updatedVideos = [...videos, video];
      setVideos(updatedVideos);
      const saved = saveData('admin_videos', updatedVideos);
      if (!saved) return;
      
      // Reset form
      setNewVideo({ file: null, title: '', thumbnail: null, duration: '', date: '' });
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
      setThumbnailPreview(null);
      const videoInput = document.getElementById('videoFile');
      const thumbInput = document.getElementById('thumbnailFile');
      if (videoInput) videoInput.value = '';
      if (thumbInput) thumbInput.value = '';
      alert(`✅ Video added! Storage usage: ${getStorageUsage()}MB / ~10MB`);
    } catch (error) {
      alert('Error adding video: ' + error.message);
    }
  };
  
  const handleUpdateVideo = () => {
    if (editingVideo) {
      const updatedVideos = videos.map(v => v.id === editingVideo.id ? editingVideo : v);
      setVideos(updatedVideos);
      saveData('admin_videos', updatedVideos);
      setEditingVideo(null);
      alert('✅ Video updated!');
    }
  };
  
  const handleDeleteVideo = (id) => {
    if (confirm('Delete this video permanently?')) {
      const updatedVideos = videos.filter(v => v.id !== id);
      setVideos(updatedVideos);
      saveData('admin_videos', updatedVideos);
      alert('✅ Video deleted!');
    }
  };
  
  // ==================== CALL MANAGEMENT ====================
  const handleCallFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      if (file.size > FILE_SIZE_LIMITS.audio) {
        alert(`❌ Audio file is too large (${getFileSizeMB(file)}MB). Please use audio under 3MB or compress it.`);
        return;
      }
      setNewCall({ ...newCall, file: file });
      setCallPreview(URL.createObjectURL(file));
    } else {
      alert('Please select a valid audio file (MP3, WAV, M4A)');
    }
  };
  
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAddCall = async () => {
    if (!newCall.file) {
      alert('⚠️ Please select an audio file!');
      return;
    }
    
    // Check total storage before adding
    const currentUsage = getStorageUsage();
    if (parseFloat(currentUsage) > 8) {
      alert(`⚠️ Storage almost full (${currentUsage}MB / 10MB). Please delete some items before adding more.`);
      return;
    }
    
    try {
      const base64 = await fileToBase64(newCall.file);
      const call = {
        id: Date.now(),
        audioUrl: base64,
        duration: parseInt(newCall.duration) || 0,
        durationFormatted: formatDuration(parseInt(newCall.duration) || 0),
        date: newCall.date || new Date().toISOString().split('T')[0],
        time: newCall.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFavorite: newCall.isFavorite,
        name: newCall.name.trim() || 'Bala Bharathi'
      };
      
      const updatedCalls = [...calls, call];
      setCalls(updatedCalls);
      const saved = saveData('admin_calls', updatedCalls);
      if (!saved) return;
      
      // Reset form
      setNewCall({ file: null, duration: '', date: '', time: '', isFavorite: false, name: '' });
      if (callPreview) URL.revokeObjectURL(callPreview);
      setCallPreview(null);
      const fileInput = document.getElementById('callFile');
      if (fileInput) fileInput.value = '';
      alert(`✅ Call added! Storage usage: ${getStorageUsage()}MB / ~10MB`);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert('❌ Storage limit exceeded! Please delete some existing calls or photos before adding new ones.');
      } else {
        alert('Error adding call: ' + error.message);
      }
    }
  };
  
  const handleUpdateCall = () => {
    if (editingCall) {
      const updatedCalls = calls.map(c => c.id === editingCall.id ? editingCall : c);
      setCalls(updatedCalls);
      saveData('admin_calls', updatedCalls);
      setEditingCall(null);
      alert('✅ Call updated!');
    }
  };
  
  const handleDeleteCall = (id) => {
    if (confirm('Delete this call recording permanently?')) {
      const updatedCalls = calls.filter(c => c.id !== id);
      setCalls(updatedCalls);
      saveData('admin_calls', updatedCalls);
      alert(`✅ Call deleted! Storage usage: ${getStorageUsage()}MB / ~10MB`);
    }
  };
  
  // Clear all data (for debugging)
  const clearAllData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL photos, videos, memories, and calls! Are you sure?')) {
      localStorage.clear();
      loadAllData();
      alert('✅ All data cleared!');
    }
  };
  
  // Refresh all data
  const refreshData = () => {
    loadAllData();
    alert(`✅ Data refreshed! Storage usage: ${getStorageUsage()}MB / ~10MB`);
  };
  
  // ==================== LOGIN ====================
  const handleLogin = () => {
    if (password === 'bala123') {
      setIsAuthenticated(true);
      setError('');
      loadAllData();
    } else {
      setError('Wrong password! ❌');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-8 border border-rose-500/30"
        >
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access 🔒</h2>
            <p className="text-gray-400">Enter password to manage content</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-rose-400"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-700 text-white py-3 rounded-lg font-semibold"
            >
              Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  const storageUsage = getStorageUsage();
  const isNearLimit = parseFloat(storageUsage) > 8;
  
  return (
    <div className="min-h-screen bg-black pb-24">
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
      >
        <ArrowLeft className="w-6 h-6 text-rose-400" />
      </button>
      
      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <button
          onClick={refreshData}
          className="bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
        >
          <RefreshCw className="w-5 h-5 text-rose-400" />
        </button>
        <button
          onClick={clearAllData}
          className="bg-red-500/20 backdrop-blur-sm p-2 rounded-full hover:bg-red-500/40 transition"
        >
          <Trash2 className="w-5 h-5 text-red-400" />
        </button>
      </div>
      
      <div className="text-center mb-8 pt-20">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Manage Photos, Memories, Videos & Calls ❤️</p>
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isNearLimit ? 'bg-red-500/20 text-red-400' : 'bg-rose-500/20 text-rose-400'}`}>
          <FileWarning className="w-4 h-4" />
          Storage: {storageUsage}MB / 10MB
          {isNearLimit && <span className="text-red-400 ml-1">⚠️ Near limit!</span>}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { id: 'photos', label: '📸 Photos', icon: Camera, count: photos.length },
            { id: 'memories', label: '✨ Special Memories', icon: Star, count: specialMemories.length },
            { id: 'videos', label: '🎬 Videos', icon: Film, count: videos.length },
            { id: 'calls', label: '📞 Calls', icon: Phone, count: calls.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-black/50 border border-rose-500/30 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.charAt(0)}</span>
              {tab.count > 0 && (
                <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* CALLS SECTION */}
        {activeTab === 'calls' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-6 border border-rose-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Add Call Recording
              </h2>
              
              {isNearLimit && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">⚠️ Storage is almost full! Please delete some existing items before adding more.</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">
                      📞 Audio File * (MP3, WAV, M4A) - Max 3MB
                    </label>
                    <input id="callFile" type="file" accept="audio/*" onChange={handleCallFileChange} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                    <p className="text-gray-500 text-xs mt-1">💡 Tip: Keep audio files under 3MB. Use online audio compressors if needed.</p>
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">👤 Caller Name</label>
                    <input 
                      type="text" 
                      placeholder="Caller Name" 
                      value={newCall.name} 
                      onChange={(e) => setNewCall({ ...newCall, name: e.target.value })} 
                      className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">⏱️ Duration (seconds) - Optional</label>
                    <input 
                      type="number" 
                      placeholder="Duration in seconds" 
                      value={newCall.duration} 
                      onChange={(e) => setNewCall({ ...newCall, duration: e.target.value })} 
                      className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-rose-400 text-sm block mb-1">📅 Date</label>
                      <input 
                        type="date" 
                        value={newCall.date} 
                        onChange={(e) => setNewCall({ ...newCall, date: e.target.value })} 
                        className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-rose-400 text-sm block mb-1">⏰ Time</label>
                      <input 
                        type="time" 
                        value={newCall.time} 
                        onChange={(e) => setNewCall({ ...newCall, time: e.target.value })} 
                        className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" 
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newCall.isFavorite} 
                      onChange={(e) => setNewCall({ ...newCall, isFavorite: e.target.checked })} 
                      className="text-rose-500 w-4 h-4" 
                    />
                    <span className="text-white">❤️ Mark as Favorite Call</span>
                  </label>
                  <button 
                    onClick={handleAddCall} 
                    disabled={isNearLimit}
                    className={`w-full px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                      isNearLimit 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-rose-500 hover:bg-rose-600'
                    } text-white`}
                  >
                    <Phone className="w-4 h-4" /> Add Call Recording
                  </button>
                </div>
                {callPreview && (
                  <div className="bg-black/30 rounded-lg p-3 border border-rose-500/20">
                    <label className="text-rose-400 text-sm block mb-2">🎵 Audio Preview</label>
                    <audio src={callPreview} controls className="w-full" />
                    <p className="text-gray-400 text-xs mt-2">Preview your call recording before adding</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Calls List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">📞 Your Call Recordings ({calls.length})</h3>
              {calls.length > 0 && (
                <div className="text-sm text-gray-400 mb-2">
                  💡 Total storage used by calls: ~{((JSON.stringify(calls).length * 2) / (1024 * 1024)).toFixed(2)}MB
                </div>
              )}
              {calls.map(call => (
                <div key={call.id} className="bg-gradient-to-r from-rose-950/20 to-black/40 rounded-xl p-4 border border-rose-500/20">
                  {editingCall?.id === call.id ? (
                    <div className="space-y-2">
                      <audio src={call.audioUrl} controls className="w-full" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="text-rose-400 text-xs block mb-1">Caller Name</label>
                          <input 
                            type="text" 
                            value={editingCall.name || ''} 
                            onChange={(e) => setEditingCall({ ...editingCall, name: e.target.value })} 
                            className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" 
                          />
                        </div>
                        <div>
                          <label className="text-rose-400 text-xs block mb-1">Duration (seconds)</label>
                          <input 
                            type="number" 
                            value={editingCall.duration} 
                            onChange={(e) => setEditingCall({ ...editingCall, duration: parseInt(e.target.value) || 0 })} 
                            className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" 
                          />
                        </div>
                        <div>
                          <label className="text-rose-400 text-xs block mb-1">Date</label>
                          <input 
                            type="date" 
                            value={editingCall.date} 
                            onChange={(e) => setEditingCall({ ...editingCall, date: e.target.value })} 
                            className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-rose-400 text-xs block mb-1">Time</label>
                          <input 
                            type="time" 
                            value={editingCall.time} 
                            onChange={(e) => setEditingCall({ ...editingCall, time: e.target.value })} 
                            className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" 
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={editingCall.isFavorite} 
                            onChange={(e) => setEditingCall({ ...editingCall, isFavorite: e.target.checked })} 
                            className="text-rose-500" 
                          />
                          <span className="text-white text-sm">Favorite ❤️</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdateCall} className="flex-1 bg-green-500 text-white px-3 py-1 rounded-lg text-sm"><Check className="w-4 h-4 inline" /> Save</button>
                        <button onClick={() => setEditingCall(null)} className="flex-1 bg-gray-500 text-white px-3 py-1 rounded-lg text-sm"><X className="w-4 h-4 inline" /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-rose-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{call.name || 'Bala Bharathi'}</p>
                            <p className="text-gray-400 text-xs">
                              {call.date ? new Date(call.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date not set'} • {call.time || 'Time not set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-rose-400 text-xs">Duration: {call.durationFormatted || formatDuration(call.duration)}</span>
                          {call.isFavorite && <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />}
                        </div>
                      </div>
                      {call.audioUrl && (
                        <audio src={call.audioUrl} controls className="w-full mt-3" />
                      )}
                      <div className="flex gap-3 mt-3">
                        <button onClick={() => setEditingCall(call)} className="text-blue-400 hover:text-blue-300 text-sm"><Edit className="w-3 h-3 inline" /> Edit</button>
                        <button onClick={() => handleDeleteCall(call.id)} className="text-red-400 hover:text-red-300 text-sm"><Trash2 className="w-3 h-3 inline" /> Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {calls.length === 0 && (
                <div className="text-center py-12">
                  <Phone className="w-16 h-16 text-rose-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">No call recordings yet.</p>
                  <p className="text-rose-400 text-sm mt-2">Add your first call recording above! 📞</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Other tabs (Photos, Memories, Videos) - Same as before but with size limits */}
        {/* ... (keep the same code for other tabs with size limits) */}
      </div>
    </div>
  );
}