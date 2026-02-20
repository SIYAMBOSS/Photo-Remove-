// --- Background Removal Logic ---
async function removeBackground() {
    const fileInput = document.getElementById('file-input');
    const loader = document.getElementById('loader');
    const uploadBox = document.getElementById('upload-box');
    const resultArea = document.getElementById('result-area');
    const outputImg = document.getElementById('output-img');
    const downloadBtn = document.getElementById('download-btn');

    if (fileInput.files.length === 0) return;

    const imageFile = fileInput.files[0];
    loader.classList.remove('hidden');

    try {
        // ব্রাউজার বেজড আনলিমিটেড ইঞ্জিন
        const blob = await imglyRemoveBackground(imageFile, {
            publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest/dist/",
            model: "medium"
        });
        
        const url = URL.createObjectURL(blob);
        outputImg.src = url;
        downloadBtn.href = url;
        downloadBtn.download = `Siyam_Clean_${Date.now()}.png`;

        uploadBox.classList.add('hidden');
        resultArea.classList.remove('hidden');
    } catch (error) {
        alert("ইঞ্জিন লোড হতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
        loader.classList.add('hidden');
    }
}

// --- Premium Share Panel System ---
function shareApp() {
    const appUrl = window.location.href;
    const shareOverlay = document.createElement('div');
    shareOverlay.id = 'share-popup';
    shareOverlay.className = "fixed inset-0 z-[5000] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade";
    
    shareOverlay.innerHTML = `
        <div class="w-full max-w-md bg-[#111] border-t border-white/10 rounded-t-[40px] p-8 pb-12 animate-up">
            <div class="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-center mb-8 text-white/50">Spread the Word</h3>

            <div class="bg-black p-2 pl-5 rounded-2xl flex items-center justify-between mb-8 border border-white/5">
                <p class="text-[10px] text-white/30 truncate mr-4 italic">${appUrl}</p>
                <button onclick="copyLink('${appUrl}', this)" class="bg-cyan-600 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
                    Copy Link
                </button>
            </div>

            <div class="grid grid-cols-4 gap-4">
                <a href="https://wa.me/?text=Check this Unlimited AI BG Remover: ${appUrl}" target="_blank" class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500"><i class="fa-brands fa-whatsapp text-2xl"></i></div>
                    <span class="text-[8px] font-bold uppercase opacity-40">WhatsApp</span>
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${appUrl}" target="_blank" class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600"><i class="fa-brands fa-facebook-f text-xl"></i></div>
                    <span class="text-[8px] font-bold uppercase opacity-40">Facebook</span>
                </a>
                <a href="https://t.me/share/url?url=${appUrl}" target="_blank" class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500"><i class="fa-brands fa-telegram text-xl"></i></div>
                    <span class="text-[8px] font-bold uppercase opacity-40">Telegram</span>
                </a>
                <button onclick="systemShare('${appUrl}')" class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white"><i class="fa-solid fa-ellipsis text-xl"></i></div>
                    <span class="text-[8px] font-bold uppercase opacity-40">More</span>
                </button>
            </div>

            <button onclick="document.getElementById('share-popup').remove()" class="w-full mt-10 text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Close Panel</button>
        </div>
    `;
    document.body.appendChild(shareOverlay);
}

function copyLink(url, btn) {
    navigator.clipboard.writeText(url);
    const oldText = btn.innerText;
    btn.innerText = "DONE!";
    btn.className = btn.className.replace('bg-cyan-600', 'bg-green-600');
    setTimeout(() => {
        btn.innerText = oldText;
        btn.className = btn.className.replace('bg-green-600', 'bg-cyan-600');
    }, 2000);
}

function systemShare(url) {
    if (navigator.share) navigator.share({ title: 'Siyam Clean AI', url: url });
}
