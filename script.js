// 1. Import PDF.js
import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

// 2. State variables
let pdfText = "";
let isWriting = false; 
let currentIndex = 0; 
const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 3. Handle PDF file selection
uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const sortedItems = content.items.sort((a, b) => b.transform[5] - a.transform[5]);
                fullText += sortedItems.map(item => item.str).join(" ") + " ";
            }
            
            pdfText = fullText;
            currentIndex = 0; 
            output.innerHTML = "";
            alert("File processed! Touch the notebook to start, pause, or resume.");
        } catch (error) {
            alert("Error processing PDF: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

// ... keep your existing imports and PDF processing ...


// 4. State for Scrape/Scroll
let isScraping = false;

function updateTextOnScrape(yPosition) {
    if (!pdfText) return;

    const rect = notebook.getBoundingClientRect();
    const relativeY = yPosition - rect.top + notebook.scrollTop;
    
    // Calculate progress (0 to 1) based on touch position relative to visible content
    const scrollableHeight = Math.max(notebook.scrollHeight, notebook.clientHeight);
    const progress = Math.min(Math.max(relativeY / scrollableHeight, 0), 1);
    
    currentIndex = Math.floor(progress * pdfText.length);
    output.textContent = pdfText.substring(0, currentIndex);
}

// 5. Gesture Handling
notebook.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isScraping = true;
        updateTextOnScrape(e.touches[0].clientY);
    } else {
        isScraping = false;
    }
}, { passive: false });

notebook.addEventListener('touchmove', (e) => {
    if (isScraping && e.touches.length === 1) {
        e.preventDefault(); // Stop scrolling while scraping
        updateTextOnScrape(e.touches[0].clientY);
    } else {
        isScraping = false; // Disable scrape if second finger touches
    }
}, { passive: false });



// 6. Trigger events
notebook.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    startWriting();
}, { passive: false });

notebook.addEventListener('click', startWriting);
