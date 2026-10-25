<script setup lang="ts">
import { ref, nextTick } from 'vue';

interface ChatOption {
  text: string;
  nextStep: string;
  actionUrl?: string;
}

interface Step {
  message: string;
  options: ChatOption[];
}

const isOpen = ref(false);


const dialogueTree: Record<string, Step> = {
  start: {
    message: 'Zdravo! Ja sam vaš biljni asistent. 🌿 Kako vam mogu pomoći danas?',
    options: [
      { text: 'Koju biljku preporučujete za početnike?', nextStep: 'beginners' },
      { text: 'Trebaju mi biljke za tamne prostorije.', nextStep: 'low_light' },
      { text: 'Kako da proverim status svoje narudžbine?', nextStep: 'order_status' },
      { text: 'Imate li savet za zalivanje zimi?', nextStep: 'watering_tips' }
    ]
  },
  beginners: {
    message: 'Za početnike su najbolje otporne biljke poput Zamije (Zamioculcas) ili Svekrvinog jezika (Sansevieria). One zahtevaju vrlo malo nege i uspevaju u skoro svim uslovima!',
    options: [
      { text: 'Pogledaj ponudu biljaka', nextStep: 'start', actionUrl: '/' },
      { text: 'Pitaj nešto drugo', nextStep: 'start' }
    ]
  },
  low_light: {
    message: 'Za prostorije sa manje prirodnog svetla idealne su Monstera, Zamija i Spatifilum (Mirni ljiljan). One odlično podnose senku!',
    options: [
      { text: 'Pitaj nešto drugo', nextStep: 'start' }
    ]
  },
  order_status: {
    message: 'Status vaših rezervacija (Rezervisano / Pristiglo / Otkazano) možete uvek videti direktno na stranici Korpe nakon što se prijavite na nalog.',
    options: [
      { text: 'Idi u Korpu', nextStep: 'start', actionUrl: '/cart' },
      { text: 'Pitaj nešto drugo', nextStep: 'start' }
    ]
  },
  watering_tips: {
    message: 'Zimi biljke rastu sporije i troše manje vode. Zalivajte ih tek kada se gornji sloj zemlje (2-3 cm) potpuno osuši pod prstima!',
    options: [
      { text: 'Hvala, razumem!', nextStep: 'start' }
    ]
  }
};

const currentStepKey = ref('start');


const messages = ref<{ sender: 'bot' | 'user'; text: string }[]>([
  { sender: 'bot', text: dialogueTree.start.message }
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const handleOptionClick = (option: ChatOption) => {
  
  messages.value.push({ sender: 'user', text: option.text });

  
  const nextStep = dialogueTree[option.nextStep];
  if (nextStep) {
    currentStepKey.value = option.nextStep;
    setTimeout(() => {
      messages.value.push({ sender: 'bot', text: nextStep.message });
      scrollToBottom();
    }, 400);
  }

  scrollToBottom();
};

const chatBody = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
  });
};
</script>

<template>
  <div class="chat-agent-wrapper">
    
    <button class="chat-toggle-btn" @click="toggleChat">
      <i v-if="!isOpen" class="fa-solid fa-comments"></i>
      <i v-else class="fa-solid fa-xmark"></i>
    </button>

    
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <div class="agent-info">
          <div class="status-dot"></div>
          <span>Biljni Asistent 🌿</span>
        </div>
        <button class="close-btn" @click="toggleChat">✕</button>
      </div>

      <div ref="chatBody" class="chat-body">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['chat-bubble', msg.sender]"
        >
          {{ msg.text }}
        </div>

        
        <div class="options-container">
          <template v-for="(opt, idx) in dialogueTree[currentStepKey].options" :key="idx">
            <router-link 
              v-if="opt.actionUrl" 
              :to="opt.actionUrl" 
              class="option-btn link-btn"
              @click="isOpen = false"
            >
              {{ opt.text }} ↗
            </router-link>
            <button 
              v-else 
              class="option-btn" 
              @click="handleOptionClick(opt)"
            >
              {{ opt.text }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-agent-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}


.chat-toggle-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #B7D894;
  color: #181d27;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background-color 0.2s;
}

.chat-toggle-btn:hover {
  transform: scale(1.08);
  background-color: #E0F8C7;
}


.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  height: 420px;
  background-color: #202734;
  border: 1px solid #36415A;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background-color: #181d27;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #36415A;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #E0F8C7;
  font-weight: bold;
  font-size: 0.9rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #B7D894;
  border-radius: 50%;
}

.close-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 1rem;
}

.chat-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}


.chat-bubble {
  max-width: 82%;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.35;
}

.chat-bubble.bot {
  background-color: #36415A;
  color: #E0F8C7;
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}

.chat-bubble.user {
  background-color: #B7D894;
  color: #181d27;
  font-weight: 600;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}


.options-container {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-btn {
  background-color: rgba(183, 216, 148, 0.1);
  border: 1px solid #B7D894;
  color: #B7D894;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  background-color: #B7D894;
  color: #181d27;
}

.link-btn {
  display: block;
  text-decoration: none;
  font-weight: bold;
}
</style>