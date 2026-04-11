import gsap from 'gsap'; 

export default class AudioManager {
  constructor() {
    this.tracks = [
      { title: "Poor, But Happy", artist: "Holizna", src: "/audio/music/poor_happy.ogg" },
      { title: "Blue Skies", artist: "Holizna", src: "/audio/music/blue_skies.ogg" },
      { title: "Letting Go Of The Past", artist: "Holizna", src: "/audio/music/letting_go.ogg" }
    ];
    
    this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
    
    this.bgm = new Audio(this.tracks[this.currentTrackIndex].src);
    this.bgm.preload = 'auto'; 
    this.bgm.loop = false; 
    this.bgm.volume = 0.4;

    this.clickSound = new Audio('/audio/sfx/click/bubble.ogg'); 
    this.clickSound.preload = 'auto';
    this.clickSound.volume = 0.6;

    this.meowSound = new Audio('/audio/sfx/meow.ogg'); 
    this.meowSound.preload = 'auto';
    this.meowSound.volume = 0.6;

    this.rainSound = new Audio('/audio/sfx/rain.ogg'); 
    this.rainSound.preload = 'auto';
    this.rainSound.loop = true; 
    this.rainSound.volume = 0; 
    this.targetRainVolume = 1; 

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
    
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') return;
    
    this.clickSound.currentTime = 0; 
    this.clickSound.play().catch(() => {}); 
  }

  playMeow() {
    if(!this.meowSound) return;
    
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') return;
    
    this.meowSound.currentTime = 0; 
    this.meowSound.play().catch(() => {}); 
  }

  playRain() {
    if(!this.rainSound) return;
    this.rainSound.play().catch(() => {});
    
    gsap.to(this.rainSound, { 
      volume: this.targetRainVolume, 
      duration: 2, 
      ease: "power2.inOut" 
    });
  }

  stopRain() {
    if(!this.rainSound) return;
    
    gsap.to(this.rainSound, { 
      volume: 0, 
      duration: 2, 
      ease: "power2.inOut",
      onComplete: () => {
        this.rainSound.pause();
      }
    });
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