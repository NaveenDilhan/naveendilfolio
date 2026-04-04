// src/AudioManager.js
export default class AudioManager {
  constructor() {
    this.tracks = [
      { title: "Cozy Morning", artist: "Lofi Girl", src: "/audio/music/poor_happy.ogg" },
      { title: "Midnight Walk", artist: "Chillhop", src: "/audio/music/blue_skies.ogg" },
      { title: "Coffee Break", artist: "Jazz Vibes", src: "/audio/music/letting_go.ogg" }
    ];
    
    this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
    
    this.bgm = new Audio(this.tracks[this.currentTrackIndex].src);
    this.bgm.loop = false; 
    this.bgm.volume = 0.4;

    this.clickSound = new Audio('/audio/sfx/click/bubble.ogg'); 
    this.clickSound.volume = 0.6;

    this.isPlaying = false;
    this.hideTimeout = null;

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

  playInitialRandom() {
    this.bgm.play().then(() => {
        this.isPlaying = true;
        if(this.ui.playBtn) this.ui.playBtn.innerText = '⏸';
    }).catch((e) => {
        console.log("Audio play failed:", e);
    });
  }

  togglePlayerUI() {
    if (!this.ui.container) return;
    const isActive = this.ui.container.classList.toggle('active');
    if (isActive) this.resetHideTimer();
  }

  playClick() {
    if(!this.clickSound) return;
    
    // Prevent the audio from attempting to play if the loading screen is still active.
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') return;
    
    this.clickSound.currentTime = 0; 
    this.clickSound.play().catch(() => {}); 
  }

  initEventListeners() {
    window.addEventListener('pointerdown', () => {
      this.playClick();
    });

    this.ui.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlay();
      this.resetHideTimer();
    });

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

    this.ui.volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      this.bgm.volume = e.target.value;
      this.resetHideTimer();
    });
    
    this.ui.volumeSlider.addEventListener('pointerdown', (e) => e.stopPropagation());

    this.bgm.addEventListener('ended', () => {
      this.changeTrack(1);
    });

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