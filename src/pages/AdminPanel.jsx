import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Lock, Plus, Image, Video, 
  Heart, Edit, Trash2, Save, X, Check,
  Film, Camera, Star, Phone, Mic, Upload,
  User, Calendar, Clock, Volume2, RefreshCw, Play, Pause
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
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', { key: key, newValue: JSON.stringify(data) }));
    window.dispatchEvent(new CustomEvent(`${key}Updated`));
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
  
  // ==================== PHOTO MANAGEMENT ====================
  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
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
        url: base64, // Store as Base64
        caption: newPhoto.caption,
        date: newPhoto.date || new Date().toLocaleDateString()
      };
      const updatedPhotos = [...photos, photo];
      setPhotos(updatedPhotos);
      saveData('admin_photos', updatedPhotos);
      
      // Reset form
      setNewPhoto({ file: null, caption: '', date: '' });
      setPhotoPreview(null);
      const fileInput = document.getElementById('photoFile');
      if (fileInput) fileInput.value = '';
      alert('✅ Photo added successfully!');
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
      
      if (isVideo) {
        // For video, convert to Base64 (large files might be slow)
        const base64 = await fileToBase64(newMemory.file);
        const memory = {
          id: Date.now(),
          url: base64, // Store as Base64
          caption: newMemory.caption,
          date: newMemory.date || new Date().toLocaleDateString(),
          type: 'video',
          thumbnail: memoryThumbnailPreview || null
        };
        const updatedMemories = [...specialMemories, memory];
        setSpecialMemories(updatedMemories);
        saveData('admin_special_memories', updatedMemories);
        alert('✅ Video memory added!');
      } else {
        // For image, convert to Base64
        const base64 = await fileToBase64(newMemory.file);
        const memory = {
          id: Date.now(),
          url: base64,
          caption: newMemory.caption,
          date: newMemory.date || new Date().toLocaleDateString(),
          type: 'image',
          thumbnail: null
        };
        const updatedMemories = [...specialMemories, memory];
        setSpecialMemories(updatedMemories);
        saveData('admin_special_memories', updatedMemories);
        alert('✅ Image memory added!');
      }
      
      // Reset form
      setNewMemory({ file: null, caption: '', date: '', thumbnail: null });
      setMemoryPreview(null);
      setMemoryThumbnailPreview(null);
      const fileInput = document.getElementById('memoryFile');
      const thumbInput = document.getElementById('memoryThumbnail');
      if (fileInput) fileInput.value = '';
      if (thumbInput) thumbInput.value = '';
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
      setNewVideo({ ...newVideo, file: file });
      setVideoPreview(URL.createObjectURL(file));
    } else {
      alert('Please select a valid video file');
    }
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
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
      // Convert video to Base64
      const base64 = await fileToBase64(newVideo.file);
      const video = {
        id: Date.now(),
        videoUrl: base64, // Store as Base64
        title: newVideo.title,
        thumbnail: thumbnailPreview || "https://images.unsplash.com/photo-1518199266791-5375a83190b5?w=400",
        duration: newVideo.duration || "0:00",
        date: newVideo.date || new Date().toLocaleDateString()
      };
      
      const updatedVideos = [...videos, video];
      setVideos(updatedVideos);
      saveData('admin_videos', updatedVideos);
      
      // Reset form
      setNewVideo({ file: null, title: '', thumbnail: null, duration: '', date: '' });
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
      setThumbnailPreview(null);
      const videoInput = document.getElementById('videoFile');
      const thumbInput = document.getElementById('thumbnailFile');
      if (videoInput) videoInput.value = '';
      if (thumbInput) thumbInput.value = '';
      alert('✅ Video added successfully!');
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
    
    try {
      // Convert audio to Base64
      const base64 = await fileToBase64(newCall.file);
      const call = {
        id: Date.now(),
        audioUrl: base64, // Store as Base64
        duration: parseInt(newCall.duration) || 0,
        durationFormatted: formatDuration(parseInt(newCall.duration) || 0),
        date: newCall.date || new Date().toISOString().split('T')[0],
        time: newCall.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFavorite: newCall.isFavorite,
        name: newCall.name.trim() || 'Bala Bharathi'
      };
      
      const updatedCalls = [...calls, call];
      setCalls(updatedCalls);
      saveData('admin_calls', updatedCalls);
      
      // Reset form
      setNewCall({ file: null, duration: '', date: '', time: '', isFavorite: false, name: '' });
      if (callPreview) URL.revokeObjectURL(callPreview);
      setCallPreview(null);
      const fileInput = document.getElementById('callFile');
      if (fileInput) fileInput.value = '';
      alert('✅ Call recording added successfully!');
    } catch (error) {
      alert('Error adding call: ' + error.message);
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
      alert('✅ Call deleted!');
    }
  };
  
  // Refresh all data
  const refreshData = () => {
    loadAllData();
    alert('✅ Data refreshed from storage!');
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
  
  return (
    <div className="min-h-screen bg-black pb-24">
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
      >
        <ArrowLeft className="w-6 h-6 text-rose-400" />
      </button>
      
      <button
        onClick={refreshData}
        className="fixed top-4 right-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
      >
        <RefreshCw className="w-5 h-5 text-rose-400" />
      </button>
      
      <div className="text-center mb-8 pt-20">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Manage Photos, Memories, Videos & Calls ❤️</p>
        <p className="text-amber-400 text-xs mt-1">⚠️ Files are stored as Base64 (works across all devices)</p>
      </div>
      
      {/* Tab Navigation - Same as before */}
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
        {/* PHOTOS SECTION - Same UI but now stores Base64 */}
        {activeTab === 'photos' && (
          <div className="space-y-8">
            {/* Add Photo Form - Same as before */}
            <div className="bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-6 border border-rose-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Add New Photo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📸 Photo File *</label>
                    <input id="photoFile" type="file" accept="image/*" onChange={handlePhotoFileChange} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📝 Caption *</label>
                    <input type="text" placeholder="Caption" value={newPhoto.caption} onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📅 Date</label>
                    <input type="date" value={newPhoto.date} onChange={(e) => setNewPhoto({ ...newPhoto, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <button onClick={handleAddPhoto} className="w-full bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition">
                    <Plus className="w-4 h-4 inline mr-1" /> Add Photo
                  </button>
                </div>
                {photoPreview && (
                  <div className="bg-black/30 rounded-lg p-3 border border-rose-500/20">
                    <label className="text-rose-400 text-sm block mb-2">Preview</label>
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Photos Grid */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Your Photos ({photos.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="bg-gradient-to-br from-rose-950/20 to-black/40 rounded-xl p-3 border border-rose-500/20">
                    {editingPhoto?.id === photo.id ? (
                      <div className="space-y-2">
                        <img src={photo.url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                        <input type="text" value={editingPhoto.caption} onChange={(e) => setEditingPhoto({ ...editingPhoto, caption: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        <input type="date" value={editingPhoto.date} onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        <div className="flex gap-2">
                          <button onClick={handleUpdatePhoto} className="flex-1 bg-green-500 text-white px-2 py-1 rounded-lg text-sm"><Check className="w-4 h-4 inline" /> Save</button>
                          <button onClick={() => setEditingPhoto(null)} className="flex-1 bg-gray-500 text-white px-2 py-1 rounded-lg text-sm"><X className="w-4 h-4 inline" /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img src={photo.url} alt={photo.caption} className="w-full h-40 object-cover rounded-lg mb-2" />
                        <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                        <p className="text-rose-400 text-xs">{photo.date}</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => setEditingPhoto(photo)} className="text-blue-400 hover:text-blue-300 text-xs"><Edit className="w-3 h-3 inline" /> Edit</button>
                          <button onClick={() => handleDeletePhoto(photo.id)} className="text-red-400 hover:text-red-300 text-xs"><Trash2 className="w-3 h-3 inline" /> Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {photos.length === 0 && <div className="text-center py-8 text-gray-400">No photos yet. Add your first photo! 📸</div>}
            </div>
          </div>
        )}
        
        {/* SPECIAL MEMORIES SECTION */}
        {activeTab === 'memories' && (
          <div className="space-y-8">
            {/* Add Memory Form - Same UI */}
            <div className="bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-6 border border-rose-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-rose-400" />
                Add Special Memory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📁 Media File (Image/Video) *</label>
                    <input id="memoryFile" type="file" accept="image/*,video/*" onChange={handleMemoryFileChange} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">🖼️ Custom Thumbnail (For Videos)</label>
                    <input id="memoryThumbnail" type="file" accept="image/*" onChange={handleMemoryThumbnailChange} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📝 Caption *</label>
                    <input type="text" placeholder="Caption" value={newMemory.caption} onChange={(e) => setNewMemory({ ...newMemory, caption: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📅 Date</label>
                    <input type="date" value={newMemory.date} onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <button onClick={handleAddMemory} className="w-full bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition">
                    <Star className="w-4 h-4 inline mr-1" /> Add Memory
                  </button>
                </div>
                <div className="space-y-3">
                  {memoryPreview && (
                    <div className="bg-black/30 rounded-lg p-3 border border-rose-500/20">
                      <label className="text-rose-400 text-sm block mb-2">🎬 Media Preview</label>
                      {newMemory.file?.type?.startsWith('video/') ? (
                        <video src={memoryPreview} className="w-full h-40 object-cover rounded-lg" controls />
                      ) : (
                        <img src={memoryPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      )}
                    </div>
                  )}
                  {memoryThumbnailPreview && (
                    <div className="bg-black/30 rounded-lg p-3 border border-rose-500/20">
                      <label className="text-rose-400 text-sm block mb-2">🖼️ Thumbnail Preview</label>
                      <img src={memoryThumbnailPreview} alt="Thumbnail Preview" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Memories Grid */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Special Memories ({specialMemories.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialMemories.map(memory => (
                  <div key={memory.id} className="bg-gradient-to-br from-rose-950/20 to-black/40 rounded-xl p-3 border border-rose-500/20">
                    {editingMemory?.id === memory.id ? (
                      <div className="space-y-2">
                        {memory.type === 'video' ? (
                          <>
                            <video src={memory.url} className="w-full h-32 object-cover rounded-lg" controls />
                            <div className="bg-black/30 rounded-lg p-2">
                              <label className="text-rose-400 text-xs">Thumbnail URL:</label>
                              <input 
                                type="text" 
                                value={editingMemory.thumbnail || ''} 
                                onChange={(e) => setEditingMemory({ ...editingMemory, thumbnail: e.target.value })} 
                                className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm mt-1" 
                                placeholder="Thumbnail image URL"
                              />
                            </div>
                          </>
                        ) : (
                          <img src={memory.url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                        )}
                        <input type="text" value={editingMemory.caption} onChange={(e) => setEditingMemory({ ...editingMemory, caption: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        <input type="date" value={editingMemory.date} onChange={(e) => setEditingMemory({ ...editingMemory, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        <div className="flex gap-2">
                          <button onClick={handleUpdateMemory} className="flex-1 bg-green-500 text-white px-2 py-1 rounded-lg text-sm"><Check className="w-4 h-4 inline" /> Save</button>
                          <button onClick={() => setEditingMemory(null)} className="flex-1 bg-gray-500 text-white px-2 py-1 rounded-lg text-sm"><X className="w-4 h-4 inline" /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {memory.type === 'video' ? (
                          <div className="relative">
                            <img 
                              src={memory.thumbnail || "https://images.unsplash.com/photo-1518199266791-5375a83190b5?w=400"} 
                              alt={memory.caption} 
                              className="w-full h-40 object-cover rounded-lg mb-2 cursor-pointer" 
                              onClick={() => window.open(memory.url, '_blank')}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={memory.url} alt={memory.caption} className="w-full h-40 object-cover rounded-lg mb-2" />
                        )}
                        <p className="text-white text-sm font-medium truncate">{memory.caption}</p>
                        <p className="text-rose-400 text-xs">{memory.date}</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => setEditingMemory(memory)} className="text-blue-400 hover:text-blue-300 text-xs"><Edit className="w-3 h-3 inline" /> Edit</button>
                          <button onClick={() => handleDeleteMemory(memory.id)} className="text-red-400 hover:text-red-300 text-xs"><Trash2 className="w-3 h-3 inline" /> Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {specialMemories.length === 0 && <div className="text-center py-8 text-gray-400">No special memories yet. Add your first memory! ✨</div>}
            </div>
          </div>
        )}
        
        {/* VIDEOS SECTION - Now stores Base64 */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-6 border border-rose-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Add New Video
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">🎥 Video File *</label>
                    <input id="videoFile" type="file" accept="video/*" onChange={handleVideoFileChange} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">🖼️ Thumbnail Image (Optional)</label>
                    <input id="thumbnailFile" type="file" accept="image/*" onChange={handleThumbnailChange} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📝 Title *</label>
                    <input type="text" placeholder="Title" value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">⏱️ Duration (e.g., 2:30)</label>
                    <input type="text" placeholder="Duration" value={newVideo.duration} onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📅 Date</label>
                    <input type="date" value={newVideo.date} onChange={(e) => setNewVideo({ ...newVideo, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <button onClick={handleAddVideo} className="w-full bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition">
                    <Plus className="w-4 h-4 inline mr-1" /> Add Video
                  </button>
                </div>
                <div className="space-y-3">
                  {videoPreview && (
                    <div className="bg-black/30 rounded-lg p-3 border border-rose-500/20">
                      <label className="text-rose-400 text-sm block mb-2">📹 Video Preview</label>
                      <video src={videoPreview} className="w-full h-40 object-cover rounded-lg" controls />
                    </div>
                  )}
                  {thumbnailPreview && (
                    <div className="bg-black/30 rounded-lg p-3 border border-rose-500/20">
                      <label className="text-rose-400 text-sm block mb-2">🖼️ Thumbnail Preview</label>
                      <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Your Videos ({videos.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(video => (
                  <div key={video.id} className="bg-gradient-to-br from-rose-950/20 to-black/40 rounded-xl p-3 border border-rose-500/20">
                    {editingVideo?.id === video.id ? (
                      <div className="space-y-2">
                        <video src={video.videoUrl} className="w-full h-32 object-cover rounded-lg" controls />
                        <input type="text" value={editingVideo.title} onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        <input type="text" value={editingVideo.duration} onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        <input type="date" value={editingVideo.date} onChange={(e) => setEditingVideo({ ...editingVideo, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        <div className="flex gap-2">
                          <button onClick={handleUpdateVideo} className="flex-1 bg-green-500 text-white px-2 py-1 rounded-lg text-sm"><Check className="w-4 h-4 inline" /> Save</button>
                          <button onClick={() => setEditingVideo(null)} className="flex-1 bg-gray-500 text-white px-2 py-1 rounded-lg text-sm"><X className="w-4 h-4 inline" /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover rounded-lg mb-2" />
                        <p className="text-white text-sm font-medium truncate">{video.title}</p>
                        <p className="text-rose-400 text-xs">{video.duration} • {video.date}</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => setEditingVideo(video)} className="text-blue-400 hover:text-blue-300 text-xs"><Edit className="w-3 h-3 inline" /> Edit</button>
                          <button onClick={() => handleDeleteVideo(video.id)} className="text-red-400 hover:text-red-300 text-xs"><Trash2 className="w-3 h-3 inline" /> Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {videos.length === 0 && <div className="text-center py-8 text-gray-400">No videos yet. Add your first video! 🎥</div>}
            </div>
          </div>
        )}
        
        {/* CALLS SECTION - Now stores Base64 */}
        {activeTab === 'calls' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-6 border border-rose-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Add Call Recording
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">📞 Audio File * (MP3, WAV, M4A)</label>
                    <input id="callFile" type="file" accept="audio/*" onChange={handleCallFileChange} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">👤 Caller Name</label>
                    <input type="text" placeholder="Caller Name" value={newCall.name} onChange={(e) => setNewCall({ ...newCall, name: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="text-rose-400 text-sm block mb-1">⏱️ Duration (seconds)</label>
                    <input type="number" placeholder="Duration in seconds" value={newCall.duration} onChange={(e) => setNewCall({ ...newCall, duration: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-rose-400 text-sm block mb-1">📅 Date</label>
                      <input type="date" value={newCall.date} onChange={(e) => setNewCall({ ...newCall, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                      <label className="text-rose-400 text-sm block mb-1">⏰ Time</label>
                      <input type="time" value={newCall.time} onChange={(e) => setNewCall({ ...newCall, time: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newCall.isFavorite} onChange={(e) => setNewCall({ ...newCall, isFavorite: e.target.checked })} className="text-rose-500 w-4 h-4" />
                    <span className="text-white">❤️ Mark as Favorite Call</span>
                  </label>
                  <button onClick={handleAddCall} className="w-full bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition">
                    <Phone className="w-4 h-4 inline mr-1" /> Add Call Recording
                  </button>
                </div>
                {callPreview && (
                  <div className="bg-black/30 rounded-lg p-3 border border-rose-500/20">
                    <label className="text-rose-400 text-sm block mb-2">🎵 Audio Preview</label>
                    <audio src={callPreview} controls className="w-full" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">📞 Your Call Recordings ({calls.length})</h3>
              {calls.map(call => (
                <div key={call.id} className="bg-gradient-to-r from-rose-950/20 to-black/40 rounded-xl p-4 border border-rose-500/20">
                  {editingCall?.id === call.id ? (
                    <div className="space-y-2">
                      <audio src={call.audioUrl} controls className="w-full" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="text-rose-400 text-xs block mb-1">Caller Name</label>
                          <input type="text" value={editingCall.name || ''} onChange={(e) => setEditingCall({ ...editingCall, name: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-rose-400 text-xs block mb-1">Duration (seconds)</label>
                          <input type="number" value={editingCall.duration} onChange={(e) => setEditingCall({ ...editingCall, duration: parseInt(e.target.value) || 0 })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-rose-400 text-xs block mb-1">Date</label>
                          <input type="date" value={editingCall.date} onChange={(e) => setEditingCall({ ...editingCall, date: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-rose-400 text-xs block mb-1">Time</label>
                          <input type="time" value={editingCall.time} onChange={(e) => setEditingCall({ ...editingCall, time: e.target.value })} className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm" />
                        </div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={editingCall.isFavorite} onChange={(e) => setEditingCall({ ...editingCall, isFavorite: e.target.checked })} className="text-rose-500" />
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
      </div>
    </div>
  );
}