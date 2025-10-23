class VideoPlayer {
    constructor() {
        this.videos = [];
        this.currentIndex = 0;
        this.isAutoplay = true;
        this.controlsVisible = true;
        this.controlsTimeout = null;
        this.hasUserInteracted = false;
        this.currentVideoType = 'local';
        this.youtubeTimer = null;
        
        // Advanced preloading system
        this.preloadedVideos = new Map();
        this.preloadQueue = [];
        this.maxPreloadedVideos = 3;
        this.isPreloading = false;
        
        // DOM elements
        this.videoElement = document.getElementById('videoPlayer');
        this.videoContainer = document.getElementById('videoContainer');
        this.brandElement = document.getElementById('brandName');
        this.progressBar = document.getElementById('progressBar');
        this.loadingElement = document.getElementById('loading');
        this.controlsElement = document.getElementById('controls');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.autoplayBtn = document.getElementById('autoplayBtn');
        this.videoInfo = document.getElementById('videoInfo');
        this.volumeIcon = document.getElementById('volumeIcon');
        this.autoplayIndicator = document.getElementById('autoplayIndicator');
        this.qualityIndicator = document.getElementById('qualityIndicator');
        this.bufferIndicator = document.getElementById('bufferIndicator');
        this.modelInfo = document.getElementById('modelInfo');
        this.endScreen = document.getElementById('endScreen');
        this.endScreenImage = document.getElementById('endScreenImage');
        
        this.init();
    }

    async init() {
        await this.loadVideoList();
        this.setupEventListeners();
        this.startPlayback();
        this.initializePreloading();
    }

    async loadVideoList() {
        // List of all videos - YouTube Embeds (Official Phone Promotional Videos)
        this.videos = [
            {
                type: 'youtube',
                youtubeId: 'XHTrLYShBRQ',
                brand: 'Apple',
                model: 'iPhone 15',
                displayName: 'Apple iPhone 15'
            },
            {
                type: 'youtube',
                youtubeId: 'xqyUdNxWazA',
                brand: 'Apple',
                model: 'iPhone 16',
                displayName: 'Apple iPhone 16'
            },
            {
                type: 'youtube',
                youtubeId: 'U4lz0LkBdXQ',
                brand: 'Samsung',
                model: 'Galaxy S24',
                displayName: 'Samsung Galaxy S24'
            },
            {
                type: 'youtube',
                youtubeId: 'Bt9zSfinwFA',
                brand: 'OPPO',
                model: 'A3 Pro',
                displayName: 'OPPO A3 Pro'
            },
            {
                type: 'youtube',
                youtubeId: 'YEb3Pxws6x4',
                brand: 'OPPO',
                model: 'Reno12 Pro',
                displayName: 'OPPO Reno12 Pro'
            },
            {
                type: 'youtube',
                youtubeId: 'bNXiJcP5u8A',
                brand: 'Realme',
                model: 'GT 7 Pro',
                displayName: 'Realme GT 7 Pro'
            },
            {
                type: 'youtube',
                youtubeId: 'HNMq5248cZg',
                brand: 'OPPO',
                model: 'Find X8',
                displayName: 'OPPO Find X8'
            },
            {
                type: 'youtube',
                youtubeId: 'kJQP7kiw5Fk',
                brand: 'OPPO',
                model: 'F27 Pro+',
                displayName: 'OPPO F27 Pro+'
            },
            // BACKUP: Safe fallback videos (always available)
            {
                type: 'youtube',
                youtubeId: 'jNQXAC9IVRw',
                brand: 'Demo',
                model: 'Sample Video',
                displayName: 'Demo Sample Video'
            },
            // Remaining videos disabled for Cloudflare Pages deployment
            // Will be added back as YouTube embeds once uploaded
            // {
            //     type: 'local',
            //     path: 'video/TECNO%20SPARK%2030%20Series%20_%20TRANSFORMERS%20Edition.mp4', // 57.3MB - Too large for Cloudflare
            //     brand: 'TECNO',
            //     model: 'SPARK 30 Series',
            //     displayName: 'TECNO SPARK 30 Series'
            // }
        ];

        console.log(`Loaded ${this.videos.length} videos with brand and model information`);
    }

    setupEventListeners() {
        // Video events
        this.videoElement.addEventListener('ended', () => {
            if (this.isAutoplay) {
                this.showEndScreen();
            }
        });

        this.videoElement.addEventListener('error', (e) => {
            console.error('Video error - file not found:', this.videos[this.currentIndex]?.path);
            console.log('Trying next video...');
            if (this.isAutoplay) {
                // Skip to next video if current one fails
                setTimeout(() => {
                    this.nextVideo();
                }, 1000);
            }
        });

        this.videoElement.addEventListener('loadstart', () => {
            this.loadingElement.style.display = 'block';
        });

        this.videoElement.addEventListener('canplay', () => {
            this.loadingElement.style.display = 'none';
            this.hideSmartIndicator('bufferIndicator');
            // Set high quality
            this.videoElement.playbackRate = 1.0;
            this.updateQualityIndicator();
            
            // Fix video aspect ratio to eliminate black bars
            this.adjustVideoFit();
            
            // Aggressive auto-play for seamless transitions
            if (this.isAutoplay && this.hasUserInteracted) {
                this.videoElement.muted = true;
                this.videoElement.play().then(() => {
                    // Unmute after play starts
                    this.videoElement.muted = false;
                    this.videoElement.volume = this.volumeSlider.value / 100;
                }).catch(() => {
                    // Silent fail
                });
            }
        });

        // Faster loading detection
        this.videoElement.addEventListener('loadeddata', () => {
            this.hideSmartIndicator('bufferIndicator');
            // Try to play as soon as data is loaded
            if (this.isAutoplay && this.hasUserInteracted) {
                this.videoElement.play().catch(() => {});
            }
        });

        // Immediate play on metadata load
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.hideSmartIndicator('bufferIndicator');
            if (this.isAutoplay && this.hasUserInteracted && this.videoElement.readyState >= 1) {
                this.videoElement.play().catch(() => {});
            }
        });

        this.videoElement.addEventListener('waiting', () => {
            this.showSmartIndicator('bufferIndicator');
        });

        this.videoElement.addEventListener('playing', () => {
            this.hideSmartIndicator('bufferIndicator');
        });

        this.videoElement.addEventListener('timeupdate', () => {
            this.updateProgress();
            this.updateTimeDisplay();
        });

        this.videoElement.addEventListener('play', () => {
            this.playPauseBtn.innerHTML = '⏸';
        });

        this.videoElement.addEventListener('pause', () => {
            this.playPauseBtn.innerHTML = '▶';
        });

        // Control button events
        this.playPauseBtn.addEventListener('click', () => {
            this.hasUserInteracted = true;
            this.togglePlayPause();
        });

        this.prevBtn.addEventListener('click', () => {
            this.previousVideo();
        });

        this.nextBtn.addEventListener('click', () => {
            this.nextVideo();
        });

        this.restartBtn.addEventListener('click', () => {
            this.restartCurrentVideo();
        });

        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
            this.updateVolumeIcon(e.target.value);
        });

        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        this.autoplayBtn.addEventListener('click', () => {
            this.toggleAutoplay();
        });

        // Mouse movement for controls visibility and cursor
        document.addEventListener('mousemove', () => {
            this.showControls();
            this.showCursor();
        });

        // Track user interaction for seamless autoplay
        document.addEventListener('click', () => {
            this.hasUserInteracted = true;
        });

        // Hide cursor after inactivity
        this.cursorTimeout = null;

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                    this.nextVideo();
                    break;
                case 'ArrowLeft':
                    this.previousVideo();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'r':
                    this.restartCurrentVideo();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'a':
                    this.toggleAutoplay();
                    break;
                case 'z':
                    this.toggleVideoFit();
                    break;
            }
        });

        // Touch events for mobile
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            this.showControls();
        });

        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextVideo();
                } else {
                    this.previousVideo();
                }
            }
        });
    }

    startPlayback() {
        if (this.videos.length > 0) {
            this.loadVideo(this.currentIndex);
        }
    }

    loadVideo(index) {
        const video = this.videos[index];
        // Display brand name in main overlay
        this.brandElement.textContent = video.brand;
        // Display model name in separate info box
        this.modelInfo.textContent = video.model;
        this.updateVideoInfo();
        
        // Hide loading screen immediately for seamless experience
        this.loadingElement.style.display = 'none';
        
        if (video.type === 'youtube') {
            this.loadYouTubeVideo(video);
        } else {
            this.loadLocalVideo(video);
        }
    }

    loadYouTubeVideo(video) {
        // Hide regular video element
        this.videoElement.style.display = 'none';
        
        // Store current video type for controls
        this.currentVideoType = 'youtube';
        
        // Create YouTube iframe with NO ADS (unlisted videos)
        const iframe = document.createElement('iframe');
        iframe.id = 'youtubePlayer';
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&controls=0&mute=0&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&fs=0&disablekb=1&playsinline=1&widget_referrer=${window.location.origin}`;
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; encrypted-media';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        
        // Add error handling for unavailable videos
        iframe.onerror = () => {
            console.log(`Video unavailable: ${video.displayName}, skipping to next...`);
            if (this.isAutoplay) {
                setTimeout(() => {
                    this.nextVideo();
                }, 2000);
            }
        };
        
        // Clear previous video and add new iframe
        this.videoContainer.innerHTML = '';
        this.videoContainer.appendChild(iframe);
        
        // Update play button state
        this.playPauseBtn.innerHTML = '⏸';
        
        // Auto-advance after video duration (2.5 minutes for YouTube)
        if (this.isAutoplay) {
            this.youtubeTimer = setTimeout(() => {
                if (this.isAutoplay) {
                    this.showEndScreen();
                }
            }, 150000); // 2.5 minutes
        }
        
        // Check if video loads properly after 5 seconds
        setTimeout(() => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc && iframeDoc.title.includes('unavailable') || iframeDoc.title.includes('private')) {
                console.log(`Video appears to be unavailable: ${video.displayName}`);
                if (this.isAutoplay) {
                    this.nextVideo();
                }
            }
        }, 5000);
    }

    loadLocalVideo(video) {
        // Hide YouTube container
        this.videoContainer.innerHTML = '';
        
        // Show regular video element
        this.videoElement.style.display = 'block';
        
        // Store current video type for controls
        this.currentVideoType = 'local';
        
        // Clear any YouTube timers
        if (this.youtubeTimer) {
            clearTimeout(this.youtubeTimer);
            this.youtubeTimer = null;
        }
        
        // Set video source with optimized loading
        this.videoElement.src = video.path;
        this.videoElement.preload = 'auto';
        this.videoElement.load();
        
        // Set initial volume
        this.videoElement.volume = this.volumeSlider.value / 100;
        this.updateVolumeIcon(this.volumeSlider.value);
        
        // Aggressive autoplay for seamless transitions
        if (this.isAutoplay) {
            // For first video, show message if autoplay fails
            if (this.currentIndex === 0 && !this.hasUserInteracted) {
                this.videoElement.play().catch(e => {
                    console.log('Initial autoplay prevented. Use play button.');
                    this.loadingElement.textContent = 'Click play to start';
                    this.loadingElement.style.display = 'block';
                });
            } else {
                // For video transitions, force play without showing messages
                this.videoElement.muted = true; // Ensure muted for autoplay
                this.videoElement.play().catch(() => {
                    // Try again with a small delay
                    setTimeout(() => {
                        this.videoElement.play().catch(() => {
                            // Final attempt
                            setTimeout(() => {
                                this.videoElement.play();
                            }, 200);
                        });
                    }, 100);
                });
            }
        }
    }

    nextVideo() {
        this.currentIndex = (this.currentIndex + 1) % this.videos.length;
        this.loadVideo(this.currentIndex);
        // Preload next video after switching
        setTimeout(() => {
            this.preloadNextVideo();
            this.cleanupPreloadedVideos();
        }, 1000);
    }

    previousVideo() {
        this.currentIndex = this.currentIndex === 0 ? this.videos.length - 1 : this.currentIndex - 1;
        this.loadVideo(this.currentIndex);
        // Preload next video after switching
        setTimeout(() => {
            this.preloadNextVideo();
            this.cleanupPreloadedVideos();
        }, 1000);
    }

    restartCurrentVideo() {
        if (this.currentVideoType === 'youtube') {
            // Restart YouTube video by reloading iframe
            this.loadVideo(this.currentIndex);
        } else {
            this.videoElement.currentTime = 0;
            this.videoElement.play();
        }
    }

    updateProgress() {
        if (this.videoElement.duration) {
            const progress = (this.videoElement.currentTime / this.videoElement.duration) * 100;
            this.progressBar.style.width = progress + '%';
        }
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.videoElement.currentTime);
        const duration = this.formatTime(this.videoElement.duration);
        this.timeDisplay.textContent = `${current} / ${duration}`;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    togglePlayPause() {
        if (this.currentVideoType === 'youtube') {
            // For YouTube, we can't control play/pause directly
            // So we simulate it by going to next video or restarting
            if (this.playPauseBtn.innerHTML === '▶') {
                this.restartCurrentVideo();
                this.playPauseBtn.innerHTML = '⏸';
            } else {
                this.nextVideo();
            }
        } else {
            // Regular video controls
            if (this.videoElement.paused) {
                this.videoElement.play();
            } else {
                this.videoElement.pause();
            }
        }
    }

    setVolume(value) {
        this.videoElement.volume = value / 100;
        this.videoElement.muted = value == 0;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
            });
        } else {
            document.exitFullscreen();
        }
    }

    toggleAutoplay() {
        this.isAutoplay = !this.isAutoplay;
        this.autoplayBtn.classList.toggle('active', this.isAutoplay);
        this.autoplayBtn.title = this.isAutoplay ? 'Autoplay: ON' : 'Autoplay: OFF';
        
        // Update smart indicator
        this.autoplayIndicator.textContent = this.isAutoplay ? 'Auto-Play ON' : 'Auto-Play OFF';
        this.autoplayIndicator.classList.toggle('autoplay', this.isAutoplay);
        this.showSmartIndicator('autoplayIndicator');
        
        setTimeout(() => {
            this.hideSmartIndicator('autoplayIndicator');
        }, 2000);
    }

    showControls() {
        this.controlsElement.classList.remove('hidden');
        this.controlsVisible = true;
        
        // Clear existing timeout
        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
        }
        
        // Hide controls after 4 seconds of inactivity
        this.controlsTimeout = setTimeout(() => {
            // Hide controls for both YouTube and local videos
            if (this.currentVideoType === 'youtube' || !this.videoElement.paused) {
                this.controlsElement.classList.add('hidden');
                this.controlsVisible = false;
            }
        }, 4000);
    }

    showCursor() {
        document.body.classList.add('show-cursor');
        
        // Clear existing timeout
        if (this.cursorTimeout) {
            clearTimeout(this.cursorTimeout);
        }
        
        // Hide cursor after 3 seconds of inactivity
        this.cursorTimeout = setTimeout(() => {
            if (!this.videoElement.paused) {
                document.body.classList.remove('show-cursor');
            }
        }, 3000);
    }

    updateVideoInfo() {
        const currentVideo = this.videos[this.currentIndex];
        if (currentVideo) {
            this.videoInfo.textContent = currentVideo.model || 'Unknown Model';
        } else {
            this.videoInfo.textContent = 'Loading...';
        }
    }

    updateVolumeIcon(value) {
        if (value == 0) {
            this.volumeIcon.textContent = '🔇';
        } else if (value < 30) {
            this.volumeIcon.textContent = '🔈';
        } else if (value < 70) {
            this.volumeIcon.textContent = '🔉';
        } else {
            this.volumeIcon.textContent = '🔊';
        }
    }

    updateQualityIndicator() {
        const video = this.videoElement;
        if (video.videoWidth >= 1920) {
            this.qualityIndicator.textContent = 'Full HD';
        } else if (video.videoWidth >= 1280) {
            this.qualityIndicator.textContent = 'HD Quality';
        } else {
            this.qualityIndicator.textContent = 'SD Quality';
        }
        
        this.showSmartIndicator('qualityIndicator');
        setTimeout(() => {
            this.hideSmartIndicator('qualityIndicator');
        }, 3000);
    }

    showSmartIndicator(indicatorId) {
        const indicator = document.getElementById(indicatorId);
        if (indicator) {
            indicator.classList.add('show');
        }
    }

    hideSmartIndicator(indicatorId) {
        const indicator = document.getElementById(indicatorId);
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    showEndScreen() {
        // Get random end screen image from your actual folder (URL encoded for space)
        const endScreenImages = [
            'END%20SCREEN/end1.jpg',
            'END%20SCREEN/end2.jpg'
        ];
        
        const randomImage = endScreenImages[Math.floor(Math.random() * endScreenImages.length)];
        
        // Set end screen content - FULL HD IMAGE
        this.endScreenImage.src = randomImage;
        
        // Force high quality loading
        this.endScreenImage.style.imageRendering = 'high-quality';
        this.endScreenImage.style.imageRendering = '-webkit-optimize-contrast';
        this.endScreenImage.loading = 'eager';
        
        // Random animation
        const animations = ['endScreenAnimation', 'endScreenSlideIn', 'endScreenZoomIn'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        this.endScreenImage.style.animation = `${randomAnimation} 3s ease-in-out`;
        
        // No text - just show the image
        
        // Wait for image to load at full quality before showing
        this.endScreenImage.onload = () => {
            // Show FULL SCREEN end screen only when image is fully loaded
            this.endScreen.classList.add('show');
            
            // PRELOAD NEXT VIDEO while end screen is showing
            this.preloadNextVideoInBackground();
            
            // Hide end screen and play next video after 4 seconds
            setTimeout(() => {
                this.endScreen.classList.remove('show');
                this.nextVideo();
            }, 4000);
        };
        
        // If image fails to load, try fallback then show
        this.endScreenImage.onerror = () => {
            // Try fallback image
            if (this.endScreenImage.src.includes('default.jpg')) {
                // Already tried fallback, just show black screen
                this.endScreenImage.style.display = 'none';
                this.endScreen.style.background = '#000';
            } else {
                // Try default image
                this.endScreenImage.src = 'END%20SCREEN/default.jpg';
                return; // Let it try to load default
            }
            
            // Show screen even if image failed
            this.endScreen.classList.add('show');
            setTimeout(() => {
                this.endScreen.classList.remove('show');
                this.nextVideo();
            }, 4000);
        };
    }

    preloadNextVideoInBackground() {
        const nextIndex = (this.currentIndex + 1) % this.videos.length;
        const nextVideo = this.videos[nextIndex];
        
        // Only preload local videos, not YouTube embeds
        if (nextVideo && nextVideo.type === 'local' && nextVideo.path) {
            // Create hidden video element for preloading
            const preloadVideo = document.createElement('video');
            preloadVideo.src = nextVideo.path;
            preloadVideo.preload = 'auto';
            preloadVideo.muted = true;
            preloadVideo.style.display = 'none';
            
            // Add to DOM temporarily for preloading
            document.body.appendChild(preloadVideo);
            
            // Remove after preloading
            setTimeout(() => {
                if (preloadVideo.parentNode) {
                    document.body.removeChild(preloadVideo);
                }
            }, 5000);
            
            console.log(`Preloading next video: ${nextVideo.displayName}`);
        } else if (nextVideo && nextVideo.type === 'youtube') {
            console.log(`Next video is YouTube embed: ${nextVideo.displayName} - No preloading needed`);
        }
    }

    adjustVideoFit() {
        // Get video and screen dimensions
        const video = this.videoElement;
        const videoAspect = video.videoWidth / video.videoHeight;
        const screenAspect = window.innerWidth / window.innerHeight;
        
        // If video is much wider or narrower than screen, adjust fit
        if (Math.abs(videoAspect - screenAspect) > 0.1) {
            if (videoAspect > screenAspect) {
                // Video is wider - zoom in slightly to fill height
                video.style.transform = 'scale(1.1)';
                video.style.objectFit = 'cover';
            } else {
                // Video is taller - ensure it covers full width
                video.style.transform = 'scaleX(1.05)';
                video.style.objectFit = 'cover';
            }
        } else {
            // Aspect ratios are close - use normal cover
            video.style.transform = 'scale(1)';
            video.style.objectFit = 'cover';
        }
        
        console.log(`Video: ${video.videoWidth}x${video.videoHeight} (${videoAspect.toFixed(2)}), Screen: ${window.innerWidth}x${window.innerHeight} (${screenAspect.toFixed(2)})`);
    }

    toggleVideoFit() {
        const video = this.videoElement;
        const currentFit = video.style.objectFit || 'cover';
        
        switch(currentFit) {
            case 'cover':
                // Switch to fill (stretches to fit, may distort)
                video.style.objectFit = 'fill';
                video.style.transform = 'scale(1)';
                this.showStatus('Video Fit: Fill (Stretch)', 2000);
                break;
            case 'fill':
                // Switch to contain (shows full video with possible black bars)
                video.style.objectFit = 'contain';
                video.style.transform = 'scale(1)';
                this.showStatus('Video Fit: Contain (Full Video)', 2000);
                break;
            case 'contain':
                // Switch back to cover with zoom
                video.style.objectFit = 'cover';
                video.style.transform = 'scale(1.1)';
                this.showStatus('Video Fit: Cover + Zoom', 2000);
                break;
            default:
                // Default to cover
                video.style.objectFit = 'cover';
                video.style.transform = 'scale(1)';
                this.showStatus('Video Fit: Cover (Default)', 2000);
        }
    }

    showStatus(message, duration = 3000) {
        // Create or update status message
        let statusEl = document.getElementById('videoStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'videoStatus';
            statusEl.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                z-index: 1000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
            document.body.appendChild(statusEl);
        }
        
        statusEl.textContent = message;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, duration);
    }

    // Simple preloading system for better performance
    initializePreloading() {
        // Simple approach - just preload next video
        setTimeout(() => {
            this.preloadNextVideo();
        }, 3000);
    }

    preloadNextVideo() {
        if (this.isPreloading) return;
        this.isPreloading = true;

        // Only preload the next video to avoid memory issues
        const nextIndex = (this.currentIndex + 1) % this.videos.length;
        const nextVideo = this.videos[nextIndex];
        
        // Only preload local videos, skip YouTube embeds
        if (nextVideo && nextVideo.type === 'local' && nextVideo.path && !this.preloadedVideos.has(nextIndex)) {
            const preloadVideo = document.createElement('video');
            preloadVideo.preload = 'metadata';
            preloadVideo.muted = true;
            preloadVideo.style.display = 'none';
            preloadVideo.src = nextVideo.path;
            
            preloadVideo.addEventListener('loadedmetadata', () => {
                this.preloadedVideos.set(nextIndex, preloadVideo);
                console.log(`Preloaded: ${nextVideo.displayName}`);
            });
            
            document.body.appendChild(preloadVideo);
        } else if (nextVideo && nextVideo.type === 'youtube') {
            console.log(`Skipping preload for YouTube video: ${nextVideo.displayName}`);
        }
        
        this.isPreloading = false;
    }

    // Clean up old preloaded videos
    cleanupPreloadedVideos() {
        if (this.preloadedVideos.size > 2) {
            const oldestKey = this.preloadedVideos.keys().next().value;
            const oldVideo = this.preloadedVideos.get(oldestKey);
            if (oldVideo && oldVideo.parentNode) {
                document.body.removeChild(oldVideo);
            }
            this.preloadedVideos.delete(oldestKey);
        }
    }
}

// Initialize the video player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VideoPlayer();
});

// Prevent right-click context menu for cleaner display
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Advanced video optimization on load
document.addEventListener('DOMContentLoaded', () => {
    // Force hardware acceleration and optimization
    const video = document.getElementById('videoPlayer');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    
    // Advanced video optimization
    video.setAttribute('x5-playsinline', 'true');
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', 'true');
    
    // Set quality preferences and hardware acceleration
    if (video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(() => {
            // Callback for high-quality rendering with GPU acceleration
        });
    }
    
    // Enable hardware decoding if available
    if ('webkitDecodedFrameCount' in video) {
        video.style.willChange = 'transform';
    }
    
    // Optimize memory usage
    video.addEventListener('loadstart', () => {
        // Clear any previous video data
        if (video.buffered.length > 0) {
            video.currentTime = 0;
        }
    });
    
    // Preload optimization
    video.addEventListener('progress', () => {
        // Optimize buffering
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const duration = video.duration;
            if (bufferedEnd >= duration * 0.1) { // 10% buffered
                video.dispatchEvent(new Event('optimized-ready'));
            }
        }
    });
});