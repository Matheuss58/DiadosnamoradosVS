// Configurações iniciais
const CONFIG = {
  audioVolume: 0.3,
  heartCount: 15,
  confettiCount: 50,
  typingSpeed: 30,
  animationDuration: 5000
};

// Elementos DOM
const DOM = {
  showMessageBtn: document.getElementById('showMessage'),
  hiddenMessage: document.getElementById('hiddenMessage'),
  heartsContainer: document.getElementById('hearts')
};

// Estado da aplicação
const STATE = {
  isAnimating: false,
  messageViewed: localStorage.getItem('messageViewed') === 'true',
  audioEnabled: true
};

// Áudio
const AUDIO = {
  player: new Audio('./audio/my-love-mine-all-mine.mp3'),
  
  init() {
    this.player.volume = CONFIG.audioVolume;
    this.player.loop = true;
  },

  async tryPlay() {
    if (!STATE.audioEnabled) return;
    try {
      await this.player.play();
    } catch (e) {
      console.warn('Interação do usuário necessária para tocar o áudio');
    }
  },

  toggleMute() {
    STATE.audioEnabled = !STATE.audioEnabled;
    this.player.muted = !STATE.audioEnabled;
    return STATE.audioEnabled;
  }
};

// Efeitos visuais
const EFFECTS = {
  hearts: [],
  typingIntervals: [],
  createHearts() {
    DOM.heartsContainer.innerHTML = '';
    this.hearts = [];
    
    for (let i = 0; i < CONFIG.heartCount; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      heart.innerHTML = '❤';
      heart.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 3 + 2}s;
        color: ${['#d81b60', '#ff4081'][Math.floor(Math.random() * 2)]};
        font-size: ${Math.random() * 20 + 15}px;
      `;
      DOM.heartsContainer.appendChild(heart);
      this.hearts.push(heart);
    }
  },
  createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    for (let i = 0; i < CONFIG.confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        background-color: hsl(${Math.random() * 360}, 100%, 75%);
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 3 + 2}s;
      `;
      container.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), CONFIG.animationDuration);
    }
    setTimeout(() => container.remove(), CONFIG.animationDuration);
  },
  typeWriter(element, text) {
    return new Promise((resolve) => {
      let i = 0;
      element.textContent = '';
      
      const interval = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(interval);
          this.typingIntervals = this.typingIntervals.filter(int => int !== interval);
          resolve();
        }
      }, CONFIG.typingSpeed);
      
      this.typingIntervals.push(interval);
    });
  },
  stopAll() {
    DOM.heartsContainer.innerHTML = '';
    this.hearts = [];
    this.typingIntervals.forEach(clearInterval);
    this.typingIntervals = [];
  }
};

// Controle de animação
async function toggleMessage() {
  if (STATE.isAnimating) return;
  
  STATE.isAnimating = true;
  
  try {
    const isOpening = DOM.hiddenMessage.style.display !== 'block';
    
    if (isOpening) {
      // Abrir mensagem
      DOM.hiddenMessage.style.display = 'block';
      DOM.showMessageBtn.textContent = 'Eu amo você!';
      STATE.messageViewed = true;
      localStorage.setItem('messageViewed', 'true');
      
      EFFECTS.stopAll();
      EFFECTS.createHearts();
      EFFECTS.createConfetti();
      await AUDIO.tryPlay();
      
      // Animar texto
      const paragraphs = DOM.hiddenMessage.querySelectorAll('p');
      paragraphs.forEach(p => p.textContent = '');
      
      for (const p of paragraphs) {
        await EFFECTS.typeWriter(p, p.getAttribute('data-original'));
      }
      
      // Animação do coração final
      const finalHeart = DOM.hiddenMessage.querySelector('.heart');
      if (finalHeart) finalHeart.style.animation = 'pulse 1.5s infinite';
    } else {
      // Fechar mensagem
      DOM.hiddenMessage.style.display = 'none';
      DOM.showMessageBtn.textContent = 'Clique bem aqui';
      AUDIO.player.pause();
      EFFECTS.stopAll();
    }
  } catch (error) {
    console.error('Erro durante animação:', error);
  } finally {
    STATE.isAnimating = false;
  }
}

// Botão de mute
function createMuteButton() {
  const muteBtn = document.createElement('button');
  muteBtn.id = 'muteBtn';
  muteBtn.textContent = '🔊';
  muteBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    cursor: pointer;
  `;
  
  muteBtn.addEventListener('click', () => {
    muteBtn.textContent = AUDIO.toggleMute() ? '🔊' : '🔇';
  });
  
  document.body.appendChild(muteBtn);
}

// Inicialização
function init() {
  // Garante que a mensagem comece oculta
  DOM.hiddenMessage.style.display = 'none';
  
  // Configura o áudio
  AUDIO.init();
  
  // Cria o botão de mute
  createMuteButton();
  
  // Configura o texto do botão baseado no estado
  DOM.showMessageBtn.textContent = STATE.messageViewed ? 'Clique bem aqui' : 'Clique bem aqui';
  
  // Adiciona o event listener (apenas uma vez)
  DOM.showMessageBtn.addEventListener('click', toggleMessage, { once: false });
  
  // Feedback tátil para mobile
  DOM.showMessageBtn.addEventListener('touchstart', () => {
    if ('vibrate' in navigator) navigator.vibrate(50);
  });
}

// Iniciar a aplicação
document.addEventListener('DOMContentLoaded', init);