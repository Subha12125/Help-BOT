document.addEventListener("DOMContentLoaded", () => {
  const messagesContainer = document.getElementById("messagesContainer");
  const welcomeCard = document.getElementById("welcomeCard");

  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  const clearChatBtn = document.getElementById("clearChatBtn");

  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const soundOnIcon = document.getElementById("soundOnIcon");
  const soundOffIcon = document.getElementById("soundOffIcon");

  const crisisModalBtn = document.getElementById("crisisModalBtn");
  const crisisModal = document.getElementById("crisisModal");
  const closeCrisisBtn = document.getElementById("closeCrisisBtn");
  const crisisCloseBottomBtn =
    document.getElementById("crisisCloseBottomBtn");

  const toggleToolsBtn = document.getElementById("toggleToolsBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const toolsSidebar = document.getElementById("toolsSidebar");

  const startBreathingBtn =
    document.getElementById("startBreathingBtn");
  const breathingOrb =
    document.getElementById("breathingOrb");
  const breathingPhaseText =
    document.getElementById("breathingPhaseText");
  const breathingCounter =
    document.getElementById("breathingCounter");

  const groundingStepPill =
    document.getElementById("groundingStepPill");
  const groundingInstruction =
    document.getElementById("groundingInstruction");
  const groundingNumber =
    document.getElementById("groundingNumber");
  const groundingProgress =
    document.getElementById("groundingProgress");

  const groundingPrevBtn =
    document.getElementById("groundingPrevBtn");
  const groundingNextBtn =
    document.getElementById("groundingNextBtn");

  const affirmationText =
    document.getElementById("affirmationText");
  const newAffirmationBtn =
    document.getElementById("newAffirmationBtn");

  let soundEnabled = true;
  let breathingActive = false;
  let breathingInterval = null;
  let breathingPhaseIndex = 0;
  let groundingStep = 0;
  let affirmationIndex = 0;
  let audioContext = null;

  const affirmations = [
    "You do not have to carry everything at once.",
    "This difficult moment does not define your entire day.",
    "You are allowed to slow down and take things one step at a time.",
    "Rest is a valid part of taking care of yourself.",
    "You have made it through difficult moments before.",
    "For now, focus only on the next small thing."
  ];

  const groundingSteps = [
    {
      number: 5,
      instruction:
        "Notice <strong>5 things you can see</strong> around you. Pay attention to colors, shapes, textures, or shadows."
    },
    {
      number: 4,
      instruction:
        "Notice <strong>4 things you can physically feel</strong>. Focus on your clothes, the floor, temperature, or your chair."
    },
    {
      number: 3,
      instruction:
        "Notice <strong>3 things you can hear</strong>. Listen for nearby sounds and distant sounds."
    },
    {
      number: 2,
      instruction:
        "Notice <strong>2 things you can smell</strong>. Take a slow breath and identify any scent around you."
    },
    {
      number: 1,
      instruction:
        "Notice <strong>1 thing you can taste</strong>. Pay attention to the taste already in your mouth or take a sip of water."
    }
  ];

  const breathingPhases = [
    {
      text: "Breathe in",
      className: "inhale"
    },
    {
      text: "Hold",
      className: "hold-in"
    },
    {
      text: "Breathe out",
      className: "exhale"
    },
    {
      text: "Rest",
      className: "hold-out"
    }
  ];

  function playChime() {
    if (!soundEnabled) return;

    try {
      if (!audioContext) {
        audioContext = new (
          window.AudioContext ||
          window.webkitAudioContext
        )();
      }

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        432,
        audioContext.currentTime
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        520,
        audioContext.currentTime + 0.25
      );

      gain.gain.setValueAtTime(
        0.035,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.7
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.7);
    } catch {
      return;
    }
  }

  messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height =
      Math.min(messageInput.scrollHeight, 130) + "px";
  });

  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });

  document.querySelectorAll(".quick-action").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.dataset.prompt;

      if (prompt) {
        sendMessage(prompt);
      }
    });
  });

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text) return;

    messageInput.value = "";
    messageInput.style.height = "auto";

    await sendMessage(text);
  });

  function getApiUrl() {
    if (
      window.location.protocol === "file:" ||
      (window.location.port && window.location.port !== "3000")
    ) {
      return "http://localhost:3000/api/chat";
    }
    return "/api/chat";
  }

  async function sendMessage(text) {
    welcomeCard?.classList.add("hidden");

    appendMessage("user", text);

    const typingIndicator = showTypingIndicator();

    sendBtn.disabled = true;

    try {
      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          message: text
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();

      removeTypingIndicator(typingIndicator);

      appendMessage(
        "assistant",
        data.reply || String(data)
      );

      playChime();
    } catch (error) {
      removeTypingIndicator(typingIndicator);

      let hint = "";
      if (window.location.protocol === "file:") {
        hint = " You are opening the HTML file directly. Please start the server with `npm start` and navigate to http://localhost:3000.";
      } else {
        hint = " Please make sure the server is running on http://localhost:3000 (`npm start`).";
      }

      appendMessage(
        "assistant",
        `I couldn't connect right now.${hint}`
      );

      console.error("Chat connection error:", error);
    } finally {
      sendBtn.disabled = false;
      messageInput.focus();
    }
  }

  function appendMessage(role, content) {
    const row = document.createElement("div");

    row.className = `message-row ${role}`;

    const wrapper = document.createElement("div");
    wrapper.className = "message-content-wrapper";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    if (role === "assistant") {
      const avatar = document.createElement("div");

      avatar.className = "message-avatar";
      avatar.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4c-1.7 2.8-4.2 4.5-7 5.1 2.1 1.4 3.4 3.3 3.7 5.8 1.1-1.5 2.1-2.5 3.3-3.1 1.2.6 2.2 1.6 3.3 3.1.3-2.5 1.6-4.4 3.7-5.8C16.2 8.5 13.7 6.8 12 4Z"/>
          <path d="M12 11.8V20"/>
        </svg>
      `;

      row.appendChild(avatar);

      bubble.innerHTML = formatMarkdown(content);
    } else {
      bubble.innerHTML = escapeHtml(content).replace(
        /\n/g,
        "<br>"
      );
    }

    const meta = document.createElement("div");

    meta.className = "message-meta";

    meta.textContent =
      role === "assistant"
        ? `Rani · ${getTime()}`
        : `You · ${getTime()}`;

    wrapper.appendChild(bubble);
    wrapper.appendChild(meta);

    row.appendChild(wrapper);

    messagesContainer.appendChild(row);

    scrollToBottom();
  }

  function showTypingIndicator() {
    const row = document.createElement("div");

    row.className = "message-row assistant typing-row";

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4c-1.7 2.8-4.2 4.5-7 5.1 2.1 1.4 3.4 3.3 3.7 5.8 1.1-1.5 2.1-2.5 3.3-3.1 1.2.6 2.2 1.6 3.3 3.1.3-2.5 1.6-4.4 3.7-5.8C16.2 8.5 13.7 6.8 12 4Z"/>
        <path d="M12 11.8V20"/>
      </svg>
    `;

    const bubble = document.createElement("div");

    bubble.className = "message-bubble typing-bubble";

    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;

    row.appendChild(avatar);
    row.appendChild(bubble);

    messagesContainer.appendChild(row);

    scrollToBottom();

    return row;
  }

  function removeTypingIndicator(element) {
    element?.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop =
      messagesContainer.scrollHeight;
  }

  function formatMarkdown(text) {
    let html = escapeHtml(text);

    html = html.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    html = html.replace(
      /\*(.*?)\*/g,
      "<em>$1</em>"
    );

    const lines = html.split("\n");

    const result = [];

    let listOpen = false;

    for (const line of lines) {
      const trimmed = line.trim();

      const isList =
        trimmed.startsWith("- ") ||
        trimmed.startsWith("* ") ||
        trimmed.startsWith("• ");

      if (isList) {
        if (!listOpen) {
          result.push("<ul>");
          listOpen = true;
        }

        result.push(
          `<li>${trimmed.slice(2)}</li>`
        );

        continue;
      }

      if (listOpen) {
        result.push("</ul>");
        listOpen = false;
      }

      if (trimmed) {
        result.push(`<p>${trimmed}</p>`);
      }
    }

    if (listOpen) {
      result.push("</ul>");
    }

    return result.join("");
  }

  function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value;

    return element.innerHTML;
  }

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  clearChatBtn.addEventListener("click", async () => {
    const confirmed = confirm(
      "Clear this conversation and start again?"
    );

    if (!confirmed) return;

    try {
      await fetch("/api/chat", {
        method: "DELETE"
      });
    } catch (error) {
      console.warn("Could not clear server conversation.", error);
    }

    messagesContainer.innerHTML = "";

    const freshWelcome = welcomeCard.cloneNode(true);

    freshWelcome.classList.remove("hidden");

    messagesContainer.appendChild(freshWelcome);

    bindQuickActions(freshWelcome);

    groundingStep = 0;
    updateGroundingUI();

    messageInput.focus();
  });

  function bindQuickActions(container) {
    container.querySelectorAll(".quick-action").forEach((button) => {
      button.addEventListener("click", () => {
        const prompt = button.dataset.prompt;

        if (prompt) {
          sendMessage(prompt);
        }
      });
    });
  }

  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    soundOnIcon.classList.toggle(
      "hidden",
      !soundEnabled
    );

    soundOffIcon.classList.toggle(
      "hidden",
      soundEnabled
    );

    if (soundEnabled) {
      playChime();
    }
  });

  crisisModalBtn.addEventListener("click", () => {
    crisisModal.classList.remove("hidden");
  });

  closeCrisisBtn.addEventListener("click", closeCrisis);

  crisisCloseBottomBtn.addEventListener(
    "click",
    closeCrisis
  );

  crisisModal.addEventListener("click", (event) => {
    if (event.target === crisisModal) {
      closeCrisis();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !crisisModal.classList.contains("hidden")
    ) {
      closeCrisis();
    }
  });

  function closeCrisis() {
    crisisModal.classList.add("hidden");
  }

  toggleToolsBtn.addEventListener("click", () => {
    toolsSidebar.classList.remove("collapsed");
  });

  closeSidebarBtn.addEventListener("click", () => {
    toolsSidebar.classList.add("collapsed");
  });

  startBreathingBtn.addEventListener("click", () => {
    if (breathingActive) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });

  function startBreathing() {
    breathingActive = true;
    breathingPhaseIndex = 0;

    startBreathingBtn.textContent = "Pause breathing";

    runBreathingPhase();
  }

  function stopBreathing() {
    breathingActive = false;

    if (breathingInterval) {
      clearInterval(breathingInterval);
      breathingInterval = null;
    }

    breathingOrb.className = "breathing-orb";
    breathingPhaseText.textContent = "Ready";
    breathingCounter.textContent = "4s";

    startBreathingBtn.textContent = "Begin breathing";
  }

  function runBreathingPhase() {
    if (!breathingActive) return;

    const phase =
      breathingPhases[breathingPhaseIndex];

    let seconds = 4;

    breathingOrb.className =
      `breathing-orb ${phase.className}`;

    breathingPhaseText.textContent = phase.text;
    breathingCounter.textContent = `${seconds}s`;

    breathingInterval = setInterval(() => {
      seconds--;

      breathingCounter.textContent = `${seconds}s`;

      if (seconds <= 0) {
        clearInterval(breathingInterval);

        breathingPhaseIndex =
          (breathingPhaseIndex + 1) %
          breathingPhases.length;

        runBreathingPhase();
      }
    }, 1000);
  }

  function updateGroundingUI() {
    const step = groundingSteps[groundingStep];

    groundingStepPill.textContent =
      `Step ${groundingStep + 1} of 5`;

    groundingNumber.textContent = step.number;

    groundingInstruction.innerHTML =
      step.instruction;

    groundingProgress.style.width =
      `${((groundingStep + 1) / groundingSteps.length) * 100}%`;

    groundingPrevBtn.disabled =
      groundingStep === 0;

    groundingNextBtn.innerHTML =
      groundingStep === groundingSteps.length - 1
        ? `
          Start again
          <svg viewBox="0 0 24 24">
            <path d="M20 12a8 8 0 0 1-14.9 4"/>
            <path d="M4 16v-4h4"/>
          </svg>
        `
        : `
          Next
          <svg viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        `;
  }

  groundingNextBtn.addEventListener("click", () => {
    if (groundingStep === groundingSteps.length - 1) {
      groundingStep = 0;
    } else {
      groundingStep++;
    }

    updateGroundingUI();
  });

  groundingPrevBtn.addEventListener("click", () => {
    if (groundingStep === 0) return;

    groundingStep--;

    updateGroundingUI();
  });

  newAffirmationBtn.addEventListener("click", () => {
    affirmationIndex =
      (affirmationIndex + 1) %
      affirmations.length;

    affirmationText.style.opacity = "0";

    setTimeout(() => {
      affirmationText.textContent =
        `"${affirmations[affirmationIndex]}"`;

      affirmationText.style.opacity = "1";
    }, 120);
  });

  affirmationText.style.transition =
    "opacity 120ms ease";

  bindQuickActions(welcomeCard);
  updateGroundingUI();
});