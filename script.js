Import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

Let pdfText = "";
Let startX, startY;
Let mode = null; 
Let baseIndex = 0; // The index where we started the swipe
Let currentIndex = 0;

Const output = document.getElementById('handwriting-output');
Const notebook = document.getElementById('notebook');
Const uploadBtn = document.getElementById('pdf-upload');

// 1. Process PDF
uploadBtn.addEventListener('change', async (e) => {
    Const file = e.target.files[0];
    If (!file) return;
    Const reader = new FileReader();
    Reader.onload = async function() {
        Const typedarray = new Uint8Array(this.result);
        Const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        Let fullText = "";
        For (let i = 1; i <= pdf.numPages; i++) {
            Const page = await pdf.getPage(i);
            Const content = await page.getTextContent();
            Const sortedItems = content.items.sort((a, b) => b.transform[5] - a.transform[5]);
            FullText += sortedItems.map(item => item.str).join("") + "\n";
        }
        PdfText = fullText;
        CurrentIndex = 0;
        Output.textContent = "";
        Alert("PDF Ready! Swipe right to reveal, drag up/down to navigate.");
    };
    Reader.readAsArrayBuffer(file);
});

// 2. Gesture Detection
notebook.addEventListener('touchstart', (e) => {
    StartX = e.touches[0].clientX;
    StartY = e.touches[0].clientY;
    Mode = null; 
    BaseIndex = currentIndex; // Lock in the starting index
}, { passive: false });

notebook.addEventListener('touchmove', (e) => {
    Const currentX = e.touches[0].clientX;
    Const currentY = e.touches[0].clientY;
    Const dx = currentX - startX;
    Const dy = currentY - startY;

    // Determine mode
    If (!mode) {
        If (Math.abs(dx) > Math.abs(dy) + 10) { 
            Mode = 'reveal';
        } else if (Math.abs(dy) > 10) {
            Mode = 'navigate';
        }
    }

    If (mode === 'reveal') {
        E.preventDefault();
        
        Const revealSpeed = 10; 
        Const deltaIndex = Math.floor(dx / revealSpeed);
        
        CurrentIndex = Math.max(0, Math.min(baseIndex + deltaIndex, pdfText.length));
        Output.textContent = pdfText.substring(0, currentIndex);
        
        // ✨ FIX: Automatically scroll notebook down as new text appears
        Notebook.scrollTop = notebook.scrollHeight;
    }
}, { passive: false });

notebook.addEventListener('touchend', () => {
    Mode = null;
});

// Add Search Functionality
Const searchInput = document.getElementById('search-input');
Const searchBtn = document.getElementById('search-btn');

SearchBtn.addEventListener('click', () => {
    Const searchTerm = searchInput.value.trim();
    
    If (!pdfText) {
        Alert("Please upload a PDF first.");
        return;
    }
    
    If (!searchTerm) return;

    // Search case-insensitive
    Const index = pdfText.toLowerCase().indexOf(searchTerm.toLowerCase());

    If (index !== -1) {
        CurrentIndex = index;
        Output.textContent = pdfText.substring(0, currentIndex);
        
        // ✨ FIX: Scroll directly to the found text position
        Notebook.scrollTop = notebook.scrollHeight;
        
        SearchInput.style.borderColor = "#4CAF50";
        SetTimeout(() => searchInput.style.borderColor = "", 1000);
    } else {
        Alert("Word not found!");
        SearchInput.style.borderColor = "red";
    }
});
