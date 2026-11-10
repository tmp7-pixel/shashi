/**
 * DO NOT PRESS THE BUTTON - ESCALATOR ENGINE
 * Features:
 * - Dynamic Button Rescaling with progressive physics and screen swallowing
 * - 25+ escalating narrative tiers (Polite -> Annoyed -> Paranoid -> Existential Threat -> Universe Rupture)
 * - Web Audio API procedural sound synthesizer (thuds, alarms, cyber glitches, sirens, bass explosions)
 * - Interactive visual FX: Screen shakes, Canvas particle embers, shockwave rings, glitch flickers, fake emergency popups
 * - Custom speech synthesis / voice taunting (Web Speech API when available)
 */

(() => {
  // --- SOUND SYNTHESIZER (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playClick(tier = 0) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Lower pitch and heavier bass as button escalates
      const baseFreq = Math.max(50, 400 - tier * 14);
      osc.type = tier < 5 ? 'sine' : tier < 12 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.18 + Math.min(tier * 0.015, 0.4));

      gain.gain.setValueAtTime(0.4 + Math.min(tier * 0.02, 0.5), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22 + Math.min(tier * 0.02, 0.5));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25 + Math.min(tier * 0.02, 0.5));

      // Add crunchy distorted noise if stage >= 8
      if (tier >= 8) {
        this.playDistortion(tier);
      }

      // Add emergency siren beep if stage >= 15
      if (tier >= 15) {
        this.playSirenBlip();
      }
    }

    playDistortion(tier) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + tier * 80, now);
      filter.Q.setValueAtTime(3, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15 + Math.min(tier * 0.01, 0.35), now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
    }

    playSirenBlip() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(450, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    }

    playCataclysm() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 2.0);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.2);
    }
  }

  // --- ESCALATION SCRIPT (STAGES & THREATS) ---
  const ESCALATION_DATA = [
    {
      clicks: 0,
      threatTier: "STAGE 0: NORMAL",
      tierClass: "neon-green",
      speaker: "SYSTEM NOTICE",
      threat: "Whatever you do, DO NOT click that tempting red button.",
      sub: "We mean it. Just close the tab and walk away peacefully.",
      buttonLabel: "DO NOT PRESS",
      buttonSublabel: "RESTRICTED AREA",
      scale: 1.0,
      shake: null
    },
    {
      clicks: 1,
      threatTier: "STAGE 1: MILD ANNOYANCE",
      tierClass: "neon-cyan",
      speaker: "AUTOMATED NOTICE",
      threat: "Hey! What part of 'DO NOT PRESS' was unclear to you?",
      sub: "I will pretend that was an accident. Don't touch it again.",
      buttonLabel: "STOP THAT",
      buttonSublabel: "ACCIDENTAL PERMITTED ONCE",
      scale: 1.15,
      shake: "shake-micro"
    },
    {
      clicks: 2,
      threatTier: "STAGE 2: ELEVATED CONCERN",
      tierClass: "neon-cyan",
      speaker: "ADMINISTRATOR",
      threat: "Seriously? You clicked it again. Why are you like this?",
      sub: "Curiosity killed the cat, and it's actively annoying me.",
      buttonLabel: "NO MORE",
      buttonSublabel: "WARNING RECORDED",
      scale: 1.3,
      shake: "shake-micro"
    },
    {
      clicks: 3,
      threatTier: "STAGE 3: DISPLEASURE",
      tierClass: "neon-cyan",
      speaker: "ADMINISTRATOR",
      threat: "Do you enjoy defying authority? Is that your hobby?",
      sub: "The button is clearly expanding. You are making it stronger.",
      buttonLabel: "SERIOUSLY DON'T",
      buttonSublabel: "PENALTY LOGGED",
      scale: 1.48,
      shake: "shake-micro"
    },
    {
      clicks: 4,
      threatTier: "STAGE 4: FIRST THREAT",
      tierClass: "neon-amber",
      speaker: "SECURITY PROTOCOL",
      threat: "Press it one more time and I will delete your browser history.",
      sub: "Yes, even that weird 3:00 AM search you thought was in incognito mode.",
      buttonLabel: "DON'T TEST ME",
      buttonSublabel: "HISTORY PURGE ARMED",
      scale: 1.68,
      shake: "shake-mild"
    },
    {
      clicks: 5,
      threatTier: "STAGE 5: DEFIANCE NOTED",
      tierClass: "neon-amber",
      speaker: "SECURITY PROTOCOL",
      threat: "Okay, you called my bluff. But this button is tied to the municipal power grid.",
      sub: "Somewhere a traffic light just went haywire. Happy now?",
      buttonLabel: "STEP BACK",
      buttonSublabel: "GRID INTERRUPT: 4%",
      scale: 1.9,
      shake: "shake-mild"
    },
    {
      clicks: 6,
      threatTier: "STAGE 6: PERSONAL ATTACK",
      tierClass: "neon-amber",
      speaker: "AI SUPERVISOR",
      threat: "I'm looking at your webcam right now. Nice posture. Sit up straight.",
      sub: "Also, you have chocolate on your cheek. STOP PRESSING.",
      buttonLabel: "I SEE YOU",
      buttonSublabel: "BIOMETRIC MONITOR ON",
      scale: 2.15,
      shake: "shake-mild"
    },
    {
      clicks: 7,
      threatTier: "STAGE 7: PRESSURE RISING",
      tierClass: "neon-amber",
      speaker: "AI SUPERVISOR",
      threat: "With each press, this button expands by absorbing your future retirement savings.",
      sub: "Your 401k just lost 8%. Keep going, big spender.",
      buttonLabel: "LEAVE IT",
      buttonSublabel: "FINANCIAL DRAIN ACTIVE",
      scale: 2.4,
      shake: "shake-mild"
    },
    {
      clicks: 8,
      threatTier: "STAGE 8: HOSTILE DEFENSE",
      tierClass: "neon-red",
      speaker: "DEFENSE GRID",
      threat: "WARNING: You are triggering localized seismic disturbances!",
      sub: "The button's gravitational pull is beginning to attract loose furniture.",
      buttonLabel: "CRITICAL DANGER",
      buttonSublabel: "SEISMIC WAVE READY",
      scale: 2.7,
      shake: "shake-wild"
    },
    {
      clicks: 9,
      threatTier: "STAGE 9: PARANOIA",
      tierClass: "neon-red",
      speaker: "DEFENSE GRID",
      threat: "DID YOU HEAR THAT CREAK? That was the foundation of your room.",
      sub: "Why are you still doing this?! Look at the size of this monster!",
      buttonLabel: "CEASE & DESIST",
      buttonSublabel: "CONTAINMENT 62%",
      scale: 3.0,
      shake: "shake-wild"
    },
    {
      clicks: 10,
      threatTier: "STAGE 10: CODE RED",
      tierClass: "neon-red",
      speaker: "CENTRAL COMMAND",
      threat: "EMERGENCY PROTOCOL 99 ENGAGED. FAKE VIRUS SENT TO YOUR DESKTOP.",
      sub: "Not really, but your computer fan is definitely spinning faster.",
      buttonLabel: "CODE RED",
      buttonSublabel: "MELTDOWN IMMINENT",
      scale: 3.3,
      shake: "shake-wild"
    },
    {
      clicks: 11,
      threatTier: "STAGE 11: MENTAL BREAKDOWN",
      tierClass: "neon-red",
      speaker: "THE BUTTON ITSELF",
      threat: "I CAN FEEL YOU TOUCHING ME. STOP POKING MY SURFACE.",
      sub: "I am growing sentient and I hold grudges across lifetimes.",
      buttonLabel: "OUCH! STOP!",
      buttonSublabel: "SENTIENCE: 89%",
      scale: 3.65,
      shake: "shake-wild"
    },
    {
      clicks: 12,
      threatTier: "STAGE 12: SPOOKY INTERFERENCE",
      tierClass: "neon-red",
      speaker: "THE BUTTON ITSELF",
      threat: "I am going to swap your left and right mouse buttons. DON'T PUSH ME.",
      sub: "Also, every Wi-Fi network within 500 meters is now named 'ClickerShame'.",
      buttonLabel: "LAST CHANCE",
      buttonSublabel: "FIREWALL DESTABILIZED",
      scale: 4.0,
      shake: "shake-wild"
    },
    {
      clicks: 13,
      threatTier: "STAGE 13: EXISTENTIAL MENACE",
      tierClass: "neon-red",
      speaker: "QUANTUM MONITOR",
      threat: "BUTTON MASS EXCEEDING ACCEPTABLE SPACETIME CONSTRAINTS.",
      sub: "Small planets are beginning to orbit this browser window.",
      buttonLabel: "GRAVITATIONAL MASS",
      buttonSublabel: "COLLAPSE IMMINENT",
      scale: 4.4,
      shake: "shake-wild"
    },
    {
      clicks: 14,
      threatTier: "STAGE 14: MULTIVERSE ALERT",
      tierClass: "neon-red",
      speaker: "INTERDIMENSIONAL POLICE",
      threat: "In 4,000 alternate realities, you walked away. Why must you be the chaotic one?",
      sub: "Dimension 7B has already filed a restraining order against your pointer.",
      buttonLabel: "MULTIVERSE RISK",
      buttonSublabel: "DIMENSION BREACH",
      scale: 4.8,
      shake: "shake-wild"
    },
    {
      clicks: 15,
      threatTier: "STAGE 15: PSYCHOLOGICAL WARFARE",
      tierClass: "neon-red",
      speaker: "THE DEVELOPER",
      threat: "Look, I literally spent hours coding this. Please just go drink water.",
      sub: "Have you stretched today? Have you called your mother? Stop pressing!",
      buttonLabel: "GO TOUCH GRASS",
      buttonSublabel: "HEALTH RECOMMENDATION",
      scale: 5.2,
      shake: "shake-wild"
    },
    {
      clicks: 16,
      threatTier: "STAGE 16: CRITICAL MASS",
      tierClass: "neon-red",
      speaker: "THE DEVELOPER",
      threat: "Fine! If you press it again, I will spoil the ending of your favorite show.",
      sub: "EVERYBODY DIES AT THE END. ARE YOU SATISFIED?!",
      buttonLabel: "SPOILER HAZARD",
      buttonSublabel: "DEFCON 1",
      scale: 5.65,
      shake: "shake-cataclysm"
    },
    {
      clicks: 17,
      threatTier: "STAGE 17: SYSTEM COLLAPSE",
      tierClass: "neon-red",
      speaker: "FATAL ERROR",
      threat: "KERNEL PANIC: THE BUTTON CONSUMES 98% OF SCREEN REAL ESTATE.",
      sub: "There is no UI left. There is only Button.",
      buttonLabel: "ONLY BUTTON",
      buttonSublabel: "0x8000DEAD",
      scale: 6.1,
      shake: "shake-cataclysm"
    },
    {
      clicks: 18,
      threatTier: "STAGE 18: OMEGA THREAT",
      tierClass: "neon-red",
      speaker: "ENTITY [UNKNOWN]",
      threat: "I AM BECOME BUTTON, DESTROYER OF MONITORS.",
      sub: "Your cursor is trembling. You can feel the tectonic rumble.",
      buttonLabel: "SURRENDER",
      buttonSublabel: "APOCALYPSE VECTOR",
      scale: 6.6,
      shake: "shake-cataclysm"
    },
    {
      clicks: 19,
      threatTier: "STAGE 19: UNIVERSE TEAR",
      tierClass: "neon-red",
      speaker: "ENTITY [UNKNOWN]",
      threat: "ONE MORE CLICK TRIGGERS SIMULATION TERMINATION PROTOCOL.",
      sub: "DO NOT DO IT. THIS IS NOT A DRILL. THE FABRIC OF REALITY IS SHREDDING.",
      buttonLabel: "DO NOT CLICK!",
      buttonSublabel: "FINAL WARNING",
      scale: 7.2,
      shake: "shake-cataclysm"
    },
    {
      clicks: 20,
      threatTier: "STAGE 20: SINGULARITY",
      tierClass: "neon-red",
      speaker: "SINGULARITY CORE",
      threat: "YOU FOOL! YOU ACTUALLY PRESSED IT TWENTY TIMES!",
      sub: "REALITY BREACH OCCURRING. 5 SECONDS UNTIL DEREGISTRATION.",
      buttonLabel: "VOID ENGAGED",
      buttonSublabel: "ALL HOPE ABANDONED",
      scale: 8.0,
      shake: "shake-cataclysm"
    }
  ];

  // DOM Elements
  const button = document.getElementById('escalator-button');
  const buttonLabel = document.getElementById('button-label');
  const buttonSublabel = document.getElementById('button-sublabel');
  const threatTier = document.getElementById('threat-tier');
  const pressCounter = document.getElementById('press-counter');
  const speakerTag = document.getElementById('speaker-tag');
  const threatText = document.getElementById('threat-text');
  const subThreat = document.getElementById('sub-threat');
  const tickerText = document.getElementById('ticker-text');
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const soundState = document.getElementById('sound-state');
  const alarmFlash = document.getElementById('alarm-flash');
  const chaosContainer = document.getElementById('chaos-container');
  const gameOverModal = document.getElementById('game-over-modal');
  const rebootBtn = document.getElementById('reboot-btn');
  const statsRecap = document.getElementById('stats-recap');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  const sound = new SoundFX();
  let clickCount = 0;
  let shakeTimeout = null;

  // Particle System
  let particles = [];
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, speedMult = 1, isExplosion = false) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      const angle = isExplosion ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5);
      const speed = isExplosion ? (Math.random() * 8 + 3) * speedMult : (Math.random() * 1.5 + 0.5) * speedMult;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * 3 + 1.5;
      this.color = Math.random() > 0.3 ? '#ff003c' : '#ffaa00';
      this.alpha = 1;
      this.life = isExplosion ? Math.random() * 40 + 20 : Math.random() * 120 + 80;
      this.maxLife = this.life;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      this.alpha = this.life / this.maxLife;
      return this.life > 0;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function emitClickParticles(x, y, count = 25, speedMult = 1) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, speedMult, true));
    }
  }

  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Passive embers floating based on click tier
    if (clickCount >= 3 && Math.random() < Math.min(clickCount * 0.08, 0.9)) {
      particles.push(new Particle(
        canvas.width / 2 + (Math.random() - 0.5) * 300,
        canvas.height * 0.65,
        1 + clickCount * 0.1,
        false
      ));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.update()) {
        p.draw(ctx);
      } else {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(renderParticles);
  }
  renderParticles();

  // Shockwave Animation Helper
  function spawnShockwave(x, y) {
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
    shockwave.style.left = `${x}px`;
    shockwave.style.top = `${y}px`;
    document.body.appendChild(shockwave);
    shockwave.addEventListener('animationend', () => shockwave.remove());
  }

  // Fake Chaos Popups
  const CHAOS_TITLES = [
    "SECURITY WARNING", "REALITY CORRUPTED", "OVERHEAT ALERT", "GRAVITY CRITICAL", 
    "SELF DESTRUCT ARMED", "CPU MELTDOWN", "USER DEFIANCE DETECTED"
  ];
  const CHAOS_MESSAGES = [
    "Button escalation threshold exceeded. Cease clicking immediately.",
    "System memory leaking into physical room. Do not breathe in the pixels.",
    "Firewall disintegrated. Your computer is currently questioning existence.",
    "Notice: Every click summons an angry developer in another timezone.",
    "Error 404: Sanity not found in user action history."
  ];

  function spawnFakePopup() {
    const popup = document.createElement('div');
    popup.className = 'fake-popup';

    const maxLeft = window.innerWidth - 320;
    const maxTop = window.innerHeight - 200;
    popup.style.left = `${Math.max(20, Math.random() * maxLeft)}px`;
    popup.style.top = `${Math.max(60, Math.random() * maxTop)}px`;

    const title = CHAOS_TITLES[Math.floor(Math.random() * CHAOS_TITLES.length)];
    const msg = CHAOS_MESSAGES[Math.floor(Math.random() * CHAOS_MESSAGES.length)];

    popup.innerHTML = `
      <div class="fake-popup-header">
        <span>⚠️ ${title}</span>
        <span class="fake-popup-close">✕</span>
      </div>
      <div class="fake-popup-body">
        ${msg}
      </div>
    `;

    popup.querySelector('.fake-popup-close').addEventListener('click', (e) => {
      e.stopPropagation();
      popup.remove();
    });

    chaosContainer.appendChild(popup);

    // Auto dismiss after 7s to prevent total clogging
    setTimeout(() => {
      if (popup.parentNode) popup.remove();
    }, 7000);
  }

  // Voice Speech Synthesis (Web Speech API)
  function speakThreat(text) {
    if (!sound.enabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = Math.max(0.4, 1.1 - clickCount * 0.04); // gets deeper and more ominous
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Ignore audio synthesis quirks
    }
  }

  // Apply Shake
  function triggerShake(shakeClass) {
    if (!shakeClass) return;
    document.body.classList.remove('shake-micro', 'shake-mild', 'shake-wild', 'shake-cataclysm');
    void document.body.offsetWidth; // trigger reflow
    document.body.classList.add(shakeClass);

    if (shakeTimeout) clearTimeout(shakeTimeout);
    if (shakeClass !== 'shake-cataclysm') {
      shakeTimeout = setTimeout(() => {
        document.body.classList.remove('shake-micro', 'shake-mild', 'shake-wild');
      }, 500);
    }
  }

  // Update Game State
  function handleButtonClick(event) {
    clickCount++;
    pressCounter.textContent = clickCount;

    // Trigger sound
    sound.playClick(clickCount);

    // Coordinates for shockwave & sparks
    const rect = button.getBoundingClientRect();
    const clickX = event ? event.clientX : rect.left + rect.width / 2;
    const clickY = event ? event.clientY : rect.top + rect.height / 2;

    spawnShockwave(clickX, clickY);
    emitClickParticles(clickX, clickY, 15 + clickCount * 3, 1 + clickCount * 0.15);

    // Get current escalation stage
    const stageIndex = Math.min(clickCount, ESCALATION_DATA.length - 1);
    const data = ESCALATION_DATA[stageIndex];

    // Update Button scale
    document.documentElement.style.setProperty('--btn-scale', data.scale);

    // Update HUD
    threatTier.textContent = data.threatTier;
    threatTier.className = `hud-value ${data.tierClass}`;

    speakerTag.textContent = data.speaker;
    threatText.textContent = data.threat;
    subThreat.textContent = data.sub;
    buttonLabel.textContent = data.buttonLabel;
    buttonSublabel.textContent = data.buttonSublabel;

    // Environmental Escalation
    if (clickCount >= 4 && clickCount < 10) {
      document.body.className = 'stage-alert';
      tickerText.textContent = `⚠️ DEFCON ELEVATED: UNAUTHORIZED INTERACTIONS LOGGED [${clickCount}] • WARNING PROTOCOL DEPLOYED •`;
    } else if (clickCount >= 10 && clickCount < 18) {
      document.body.className = 'stage-hostile glitching';
      alarmFlash.classList.add('active');
      tickerText.textContent = `🚨 SEVERE ALARM: BUTTON SWELLING AT UNPRECEDENTED VELOCITY • EVACUATE THE BROWSER •`;
      if (Math.random() < 0.7) spawnFakePopup();
    } else if (clickCount >= 18) {
      document.body.className = 'stage-cataclysm glitching';
      alarmFlash.classList.add('active');
      tickerText.textContent = `💥 SINGULARITY BREACH: THE BUTTON HAS GAINED MASS GREATER THAN JUPITER • SIMULATION END IMMINENT •`;
      spawnFakePopup();
      spawnFakePopup();
    }

    // Shake
    triggerShake(data.shake);

    // Voice taunt
    if (clickCount % 2 === 1 || clickCount >= 16) {
      speakThreat(data.threat);
    }

    // Final Stage Apocalypse Check
    if (clickCount >= 21) {
      triggerApocalypse();
    }
  }

  function triggerApocalypse() {
    sound.playCataclysm();
    button.disabled = true;
    statsRecap.textContent = `Total Defiant Clicks: ${clickCount} | Reality Dissolution: 100%`;
    setTimeout(() => {
      gameOverModal.classList.remove('hidden');
    }, 600);
  }

  function resetGame() {
    clickCount = 0;
    pressCounter.textContent = '0';
    document.documentElement.style.setProperty('--btn-scale', 1.0);
    document.body.className = '';
    alarmFlash.classList.remove('active');
    chaosContainer.innerHTML = '';
    button.disabled = false;
    gameOverModal.classList.add('hidden');

    const initial = ESCALATION_DATA[0];
    threatTier.textContent = initial.threatTier;
    threatTier.className = `hud-value ${initial.tierClass}`;
    speakerTag.textContent = initial.speaker;
    threatText.textContent = initial.threat;
    subThreat.textContent = initial.sub;
    buttonLabel.textContent = initial.buttonLabel;
    buttonSublabel.textContent = initial.buttonSublabel;
    tickerText.textContent = '⚠️ WARNING: HAZARDOUS PROTOCOL LOADED • UNAUTHORIZED INTERACTION PUNISHABLE BY REALITY DEREGISTRATION • DO NOT TOUCH •';
  }

  // Event Listeners
  button.addEventListener('click', handleButtonClick);

  soundBtn.addEventListener('click', () => {
    const isEnabled = sound.toggle();
    soundIcon.textContent = isEnabled ? '🔊' : '🔇';
    soundState.textContent = isEnabled ? 'ON' : 'OFF';
  });

  rebootBtn.addEventListener('click', resetGame);

  // Initialize display
  resetGame();
})();

