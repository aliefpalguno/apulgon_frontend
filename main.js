import axios from 'axios';

// Ambil referensi elemen dari DOM
const chatInputBox = document.querySelector('.chat-input-box');
const chatResponseContainer = document.querySelector('.chat-response-container');

// Smooth scroll to the testimonials section when the "Waste Dashboard" button is clicked
document.querySelector('.btn.btn-secondary').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent the default anchor behavior

  // Scroll smoothly to the testimonials section
  document.querySelector('.testimonials').scrollIntoView({
    behavior: 'smooth'
  });
});

// Smooth scroll to the chat-input-section when the "Get Started" button is clicked
document.querySelector('.btn.btn-primary').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent the default anchor behavior

  // Scroll smoothly to the chat-input-section
  document.querySelector('.chat-input-section').scrollIntoView({
    behavior: 'smooth'
  });
});


// Fungsi untuk menampilkan pesan "Generating..."
function showGeneratingMessage() {
  // Make sure the container is visible
  chatResponseContainer.style.display = 'block';

  const generatingBox = document.createElement('div');
  generatingBox.className = 'generating-box';
  generatingBox.innerHTML = `<p class="generating-message">Generating...</p>`;
  chatResponseContainer.appendChild(generatingBox);
}

// Fungsi untuk menghapus pesan "Generating..." setelah respons diterima
function removeGeneratingMessage() {
  const generatingBox = document.querySelector('.generating-box');
  if (generatingBox) {
    generatingBox.remove();
  }
}

// Fungsi untuk menampilkan respons dengan animasi kata per kata
function displayResponse(responseData) {
  removeGeneratingMessage(); // Hapus pesan "Generating..." sebelum menampilkan respons

  chatResponseContainer.innerHTML = '';
  const responseBox = document.createElement('div');
  responseBox.className = 'response-box';

  const responseMessage = document.createElement('p');
  responseMessage.className = 'response-message';
  responseBox.appendChild(responseMessage);
  chatResponseContainer.appendChild(responseBox);

  let words = responseData.split(' ');
  let wordIndex = 0;

  function typeWord() {
    if (wordIndex < words.length) {
      responseMessage.innerHTML += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
      wordIndex++;
      setTimeout(typeWord, 200); // Delay between words
    }
  }

  typeWord();
}

// Fungsi untuk mengirim permintaan API
async function sendRequest(prompt) {
  try {
    showGeneratingMessage(); // Tampilkan pesan "Generating..." saat menunggu respons

    const response = await axios.post('http://localhost:3000/api/post-chatbot', { prompt }, {
      headers: {
        'x-socket-id': socket.id // Kirimkan ID socket di header
      }
    });

    const textOutput = response.data;
    
    // Simpan respons ke Session Storage
    sessionStorage.setItem('apiResponse', JSON.stringify(textOutput));
    
    // Tampilkan data di frontend dengan animasi
    displayResponse(textOutput);
    
    // Bersihkan input setelah pengiriman
    chatInputBox.value = '';
  } catch (error) {
    console.error('Error:', error.message);
    removeGeneratingMessage(); // Hapus pesan "Generating..." jika terjadi kesalahan
  }
}

// Ambil data dari Session Storage saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  const savedResponse = sessionStorage.getItem('apiResponse');

  if (savedResponse) {
    const responseData = JSON.parse(savedResponse);
    
    // Make the container visible if there's a saved response
    chatResponseContainer.style.display = 'block';
    displayResponse(responseData);
  }
});

// Koneksi ke Socket.io
const socket = io('http://localhost:3000');

// Event listener untuk tombol kirim
document.querySelector('.chat-input-icons').addEventListener('click', () => {
  const prompt = chatInputBox.value;
  
  if (prompt) {
    sendRequest(prompt);
  }
});

// Event listener untuk input box untuk mendeteksi Enter
chatInputBox.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Mencegah form submit jika ada
    const prompt = chatInputBox.value;
    
    if (prompt) {
      sendRequest(prompt);
    }
  }
});

// Menerima pembaruan dari server melalui Socket.IO
socket.on('dataset-updated', (textOutput) => {
  // Simpan respons ke Session Storage
  sessionStorage.setItem('apiResponse', JSON.stringify(textOutput));

  // Tampilkan data di frontend dengan animasi
  displayResponse(textOutput);
});
