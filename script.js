let currentMode = 'ocr';
const chatWindow = document.getElementById('chat-window');
const fileInput = document.getElementById('file-input');
const loaderSpinner = document.getElementById('loader-spinner');

// --- ১. টুল সিলেকশন ---
function triggerInput(mode) {
    currentMode = mode;
    fileInput.click();
}

// --- ২. মেইন প্রসেসিং হ্যান্ডলার ---
fileInput.onchange = async function() {
    if (this.files.length === 0) return;
    const file = this.files[0];
    const url = URL.createObjectURL(file);
    
    appendMessage('user', `<img src="${url}" class="rounded-2xl max-w-sm shadow-xl border border-white/10">`);
    
    // লাইভ প্রসেসিং ইন্ডিকেটর (Reload Animation)
    const procId = "ai-proc-" + Date.now();
    appendMessage('ai', `
        <div id="${procId}" class="flex items-center gap-3">
            <div class="w-4 h-4 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 animate-pulse">AI Engine Processing...</p>
        </div>
    `);

    loaderSpinner.classList.remove('hidden');

    try {
        if (currentMode === 'ocr') {
            await runOCR(file, procId);
        } else {
            await runBGRemoval(file, procId);
        }
    } catch (e) {
        document.getElementById(procId).innerHTML = `<span class="text-red-500 text-[10px] uppercase font-bold">Error: Connection Failed</span>`;
        showToast("Processing failed!", "error");
    } finally {
        loaderSpinner.classList.add('hidden');
        this.value = '';
    }
};

// --- ৩. OCR Engine ---
async function runOCR(file, procId) {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('ben+eng');
    await worker.initialize('ben+eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    document.getElementById(procId).closest('.animate-up').remove(); // প্রসেসিং মেসেজ রিমুভ

    if (text.trim()) {
        appendMessage('ai', `
            <div class="space-y-4">
                <p class="text-[9px] text-cyan-500 font-black tracking-[0.3em] uppercase opacity-40">Extracted Content</p>
                <p class="text-[15px] leading-relaxed text-white/95 whitespace-pre-line">${text.trim()}</p>
                <button onclick="copyText(this)" class="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all">Copy Text</button>
            </div>
        `);
    } else {
        showToast("No text found in image!", "error");
    }
}

// --- ৪. BG Removal Engine ---
async function runBGRemoval(file, procId) {
    const config = {
        publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest/dist/",
        model: "medium"
    };
    const blob = await imglyRemoveBackground(file, config);
    const resultUrl = URL.createObjectURL(blob);

    document.getElementById(procId).closest('.animate-up').remove(); // প্রসেসিং মেসেজ রিমুভ

    appendMessage('ai', `
        <div class="space-y-4">
            <p class="text-[9px] text-green-500 font-black tracking-[0.3em] uppercase opacity-40">Background Cleared</p>
            <div class="bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] rounded-3xl border border-white/5 overflow-hidden">
                <img src="${resultUrl}" class="w-full h-auto">
            </div>
            <a href="${resultUrl}" download="SiyamAI_${Date.now()}.png" class="flex items-center justify-center gap-3 w-full bg-green-600 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                <i class="fa-solid fa-download text-sm"></i> Download PNG
            </a>
        </div>
    `);
}

// --- ৫. হেল্পার ফাংশনস ---
function appendMessage(sender, content) {
    const div = document.createElement('div');
    div.className = sender === 'user' ? "flex flex-col items-end animate-up ml-auto" : "flex flex-col items-start animate-up mr-auto";
    div.innerHTML = `<div class="${sender === 'user' ? 'bg-cyan-600' : 'bg-[#111] border border-white/5'} p-4 rounded-[28px] ${sender === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} max-w-[95%] shadow-2xl">${content}</div>`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showToast(msg, type) {
    const toast = document.getElementById('custom-toast');
    const msgEl = document.getElementById('toast-msg');
    const iconEl = document.getElementById('toast-icon');
    
    msgEl.innerText = msg;
    iconEl.innerHTML = type === 'success' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';
    iconEl.className = type === 'success' ? "w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 text-lg" : "w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 text-lg";

    toast.classList.remove('opacity-0', 'scale-90');
    toast.classList.add('opacity-100', 'scale-100');
    setTimeout(() => { toast.classList.add('opacity-0', 'scale-90'); }, 3000);
}

function copyText(btn) {
    const text = btn.previousElementSibling.innerText;
    navigator.clipboard.writeText(text);
    showToast("Text copied to clipboard", "success");
}

// --- ৬. PWA & Back Button System ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-banner').classList.remove('hidden');
});

document.getElementById('install-button').onclick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        document.getElementById('install-banner').classList.add('hidden');
    }
};

function refreshApp() {
    if(confirm("Refresh Siyam AI?")) location.reload();
}

// Back Button Fix
window.history.pushState({ page: 1 }, "", "");
window.onpopstate = function() {
    if(confirm("Exit App?")) window.history.back();
    else window.history.pushState({ page: 1 }, "", "");
};
