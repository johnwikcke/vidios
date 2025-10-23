# 🎥 Phone Store Video Display System

A professional video display system for phone stores with automatic playback, brand/model display, and high-quality video streaming.

## 🚀 Netlify Deployment Guide

### Step 1: Prepare Your Files
1. Create a folder structure like this:
```
your-project/
├── index.html
├── script.js
├── netlify.toml
├── _headers
└── video/
    ├── your-video-1.mp4
    ├── your-video-2.mp4
    └── ... (all your phone videos)
```

### Step 2: Upload Videos
1. Put all your phone brand videos in the `video/` folder
2. Supported formats: `.mp4`, `.webm`, `.ogg`
3. Keep file names descriptive (e.g., "iPhone 15 Pro.mp4", "OPPO A5 Pro.mp4")

### Step 3: Update Video List
1. Open `script.js`
2. Find the `loadVideoList()` function
3. Update the video paths to match your actual files:

```javascript
this.videos = [
    {
        path: 'video/iPhone-15-Pro.mp4',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        displayName: 'Apple iPhone 15 Pro'
    },
    {
        path: 'video/OPPO-A5-Pro.mp4',
        brand: 'OPPO',
        model: 'A5 Pro 5G',
        displayName: 'OPPO A5 Pro 5G'
    },
    // Add all your videos here...
];
```

### Step 4: Deploy to Netlify

#### Option A: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag your entire project folder to the deploy area
4. Your site will be live instantly!

#### Option B: Git Integration
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Auto-deploy on every push

### Step 5: Configure for TV Display
1. Open your Netlify site URL
2. Press F11 for fullscreen
3. Click play to start the video loop
4. Perfect for store displays!

## ✨ Features

- **Auto-play video loop** - Continuous playback
- **Brand & model display** - Shows phone information
- **High-quality streaming** - Optimized for Netlify CDN
- **Preloading system** - Instant video switching
- **Professional controls** - Play/pause, volume, navigation
- **Mobile responsive** - Works on all devices
- **TV optimized** - Perfect for store displays

## 🎯 Optimization Tips

### For Better Performance:
1. **Compress videos** to reduce file size
2. **Use MP4 format** for best compatibility
3. **Keep videos under 50MB** each for faster loading
4. **Use consistent resolution** (1080p recommended)

### Video Compression:
```bash
# Using FFmpeg to optimize videos
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

## 🔧 Customization

### Change Brand Colors:
Edit the CSS in `index.html`:
```css
.progress-bar {
    background: #your-brand-color; /* Change this */
}

.control-btn.play-pause {
    background: #your-brand-color; /* And this */
}
```

### Add More Video Formats:
Update the video element in `index.html`:
```html
<video>
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
</video>
```

## 📱 Mobile & TV Support

- **Touch controls** - Swipe to change videos
- **Keyboard shortcuts** - Arrow keys, spacebar
- **Fullscreen mode** - F key or button
- **Auto-hide controls** - Clean viewing experience

## 🛠️ Troubleshooting

### Videos Not Loading:
1. Check file paths in `script.js`
2. Ensure videos are in `video/` folder
3. Check Netlify deploy logs
4. Verify file formats are supported

### Slow Loading:
1. Compress video files
2. Use Netlify's CDN optimization
3. Enable preloading in browser
4. Check internet connection

### Autoplay Issues:
1. Click play button once to enable autoplay
2. Ensure videos are muted initially
3. Check browser autoplay policies

## 📊 File Size Limits

- **Netlify Free**: 100MB total site size
- **Netlify Pro**: 500MB total site size
- **Recommendation**: Keep each video under 20MB

## 🎨 Brand Customization

The system automatically detects brands from filenames:
- **Apple** - iPhone models
- **OPPO** - A, F, K series
- **Realme** - Number and C series
- **Vivo** - V, Y series
- **TECNO** - SPARK series

## 📞 Support

For issues or customization requests, check:
1. Browser console for errors
2. Netlify deploy logs
3. Video file formats and sizes
4. Network connectivity

---

**🎯 Perfect for phone stores, showrooms, and retail displays!**