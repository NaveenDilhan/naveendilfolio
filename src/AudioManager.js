// src/AudioManager.js
export default class AudioManager {
  constructor() {
    // 1. Define your soundtracks here 
    this.tracks = [
      { title: "Cozy Morning", artist: "Lofi Girl", src: "/audio/music/poor_happy.ogg" },
      { title: "Midnight Walk", artist: "Chillhop", src: "/audio/music/blue_skies.ogg" },
      { title: "Coffee Break", artist: "Jazz Vibes", src: "/audio/music/letting_go.ogg" }
    ];
    
    // Start with a random track
    this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
    
    // 2. Setup Audio elements
    this.bgm = new Audio(this.tracks[this.currentTrackIndex].src);
    this.bgm.loop = false; 
    this.bgm.volume = 0.4;

    this.clickSound = new Audio('/audio/sfx/click/bubble.ogg'); 
    this.clickSound.volume = 0.6;

    this.isPlaying = false;
    this.hideTimeout = null;

    // 3. DOM Elements (Removed speaker button references)
    this.ui = {
      container: document.getElementById('music-player'),
      trackName: document.getElementById('track-name'),
      trackArtist: document.getElementById('track-artist'),
      playBtn: document.getElementById('play-pause-btn'),
      prevBtn: document.getElementById('prev-track'),
      nextBtn: document.getElementById('next-track'),
      volumeSlider: document.getElementById('volume-slider')
    };

    if(this.ui.container) {
        this.initEventListeners();
        this.updateTrackInfo();
    }
  }

  // Called from App.js when the loading screen disappears
  playInitialRandom() {
    this.bgm.play().then(() => {
        this.isPlaying = true;
        if(this.ui.playBtn) this.ui.playBtn.innerText = '⏸';
    }).catch(() => {
        // If browser blocks autoplay due to lack of user interaction, 
        // wait for the very first click on the document to start the music.
        console.log("Autoplay prevented by browser. Music will start on first click.");
        const playOnInteract = () => {
            this.bgm.play();
            this.isPlaying = true;
            if(this.ui.playBtn) this.ui.playBtn.innerText = '⏸';
            window.removeEventListener('pointerdown', playOnInteract);
        };
        window.addEventListener('pointerdown', playOnInteract);
    });
  }

  // Toggled via the 3D raycaster in App.js
  togglePlayerUI() {
    if (!this.ui.container) return;
    const isActive = this.ui.container.classList.toggle('active');
    if (isActive) this.resetHideTimer();
  }

  playClick() {
    if(!this.clickSound) return;
    this.clickSound.currentTime = 0; 
    this.clickSound.play().catch(() => {}); 
  }

  initEventListeners() {
    // Global click sound for EVERY click on the website
    window.addEventListener('pointerdown', () => {
      this.playClick();
    });

    // Pause/Play
    this.ui.playBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents click passing through to the canvas
      this.togglePlay();
      this.resetHideTimer();
    });

    // Next/Prev Tracks
    this.ui.nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeTrack(1);
      this.resetHideTimer();
    });

    this.ui.prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeTrack(-1);
      this.resetHideTimer();
    });

    // Volume Slider
    this.ui.volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      this.bgm.volume = e.target.value;
      this.resetHideTimer();
    });
    
    // Prevent slider clicks from closing modals/interacting with canvas
    this.ui.volumeSlider.addEventListener('pointerdown', (e) => e.stopPropagation());

    // Auto-play next track when current ends
    this.bgm.addEventListener('ended', () => {
      this.changeTrack(1);
    });

    // Keep player open if mouse is hovering over it
    this.ui.container.addEventListener('mouseenter', () => clearTimeout(this.hideTimeout));
    this.ui.container.addEventListener('mouseleave', () => this.resetHideTimer());
  }

  togglePlay() {
    if (this.isPlaying) {
      this.bgm.pause();
      this.ui.playBtn.innerText = '▶️';
    } else {
      this.bgm.play().catch(() => {});
      this.ui.playBtn.innerText = '⏸';
    }
    this.isPlaying = !this.isPlaying;
  }

  changeTrack(direction) {
    this.currentTrackIndex += direction;
    
    // Loop around array boundaries
    if (this.currentTrackIndex < 0) this.currentTrackIndex = this.tracks.length - 1;
    if (this.currentTrackIndex >= this.tracks.length) this.currentTrackIndex = 0;

    this.bgm.src = this.tracks[this.currentTrackIndex].src;
    this.updateTrackInfo();
    
    if (this.isPlaying) {
      this.bgm.play();
    }
  }

  updateTrackInfo() {
    this.ui.trackName.innerText = this.tracks[this.currentTrackIndex].title;
    this.ui.trackArtist.innerText = this.tracks[this.currentTrackIndex].artist;
  }

  resetHideTimer() {
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.ui.container.classList.remove('active');
    }, 4000); 
  }
}