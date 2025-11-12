// chatbot.js — versi final dengan dua sumber knowledge
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("chatbot-container");

  // Load UI chatbot dari file HTML
  const html = await fetch("chatbot.html").then((r) => r.text());
  container.innerHTML = html;

  // Tambahkan stylesheet
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/chatbot.css";
  document.head.appendChild(link);

  // Ambil elemen penting
  const chatBox = document.getElementById("chat-box");
  const chatIcon = document.getElementById("chat-icon");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("chat-messages");

  // Toggle tampilan chat
  chatIcon.addEventListener("click", () => {
    chatBox.classList.toggle("hidden");
  });

  // Load dua sumber knowledge
  let knowledge = {};
  let priceKnowledge = {};

  try {
    knowledge = await fetch("knowledge.json").then((r) => r.json());
  } catch (err) {
    console.warn("Gagal memuat knowledge.json:", err);
  }

  try {
    priceKnowledge = await fetch("price_knowledge.json").then((r) => r.json());
  } catch (err) {
    console.warn("Gagal memuat price_knowledge.json:", err);
  }

  // Event untuk input user
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      const userText = input.value.trim();
      const cleanText = userText.toLowerCase();
      addMessage("user", userText);
      input.value = "";

      const response = getResponse(cleanText, knowledge, priceKnowledge);
      setTimeout(() => addMessage("bot", response), 400);
    }
  });

  // Tambahkan pesan ke kotak chat
  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Fungsi utama mencari jawaban
  function getResponse(userText, knowledge, priceData) {
    // Cek kategori umum (salam, sapa, about)
    for (const category in knowledge) {
      for (const item of knowledge[category]) {
        if (userText.includes(item.question.toLowerCase())) {
          return item.answer;
        }
      }
    }

    // Cek kategori harga (price list)
    for (const category in priceData) {
      for (const service of priceData[category]) {
        const serviceName = service.service.toLowerCase();

        // Cek apakah user menyebut layanan atau kata "harga" + nama layanan
        if (
          userText.includes(serviceName) ||
          userText.includes("harga " + serviceName) ||
          userText.includes("biaya " + serviceName) ||
          userText.includes("sewa " + serviceName)
        ) {
          return `${service.service}: ${service.description}. Harga: ${service.price}`;
        }
      }
    }

    // Cek pertanyaan umum tentang "harga" tapi tanpa layanan spesifik
    if (userText.includes("harga") || userText.includes("biaya") || userText.includes("sewa")) {
      return "Bisa jelaskan layanan yang kamu maksud? Misalnya: 'harga videographer', 'biaya editing', atau 'sewa fotografer'.";
    }

    // Jika tidak ada hasil
    return "Maaf, saya belum punya informasi tentang itu. hubungin aja admin kami ya";
  }
});
