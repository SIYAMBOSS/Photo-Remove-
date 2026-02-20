let deferredPrompt;
const installBtn = document.getElementById('pwa-install');

// --- ১. PWA Install Logic ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden'); // ইনস্টল বাটন দেখাও
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.classList.add('hidden'); // ইনস্টল করলে বাটন হাইড করো
        }
        deferredPrompt = null;
    }
});

// আগে থেকেই ইনস্টল থাকলে বাটন দেখাবে না
window.addEventListener('appinstalled', () => {
    installBtn.classList.add('hidden');
});

// --- ২. Main Processing Function ---
async function startCleaning() {
    const fileInput = document.getElementById('file-input');
    const loader = document.getElementById('loader');
    const uploadView = document.getElementById('upload-view');
    const resultView = document.getElementById('result-view');
    const outputImg = document.getElementById('output-img');
    const downloadBtn = document.getElementById('download-btn');

    if (fileInput.files.length === 0) return;
    
    loader.classList.remove('hidden');

    try {
        const file = fileInput.files[0];
        const config = {
            publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest/dist/",
            model: "medium"
        };
        
        const blob = await imglyRemoveBackground(file, config);
        const url = URL.createObjectURL(blob);
        
        outputImg.src = url;
        downloadBtn.href = url;
        downloadBtn.download = `PhotoClear_${Date.now()}.png`;

        uploadView.classList.add('hidden');
        resultView.classList.remove('hidden');
    } catch (error) {
        alert("Error: AI Engine failed to load.");
    } finally {
        loader.classList.add('hidden');
    }
}

// --- ৩. Navigation Fix ---
window.history.pushState({ page: 1 }, "", "");
window.onpopstate = () => {
    if(confirm("Do you want to exit?")) {
        window.history.back();
    } else {
        window.history.pushState({ page: 1 }, "", "");
    }
};
