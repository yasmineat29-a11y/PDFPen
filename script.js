// 1. Import PDF.js
import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

// 2. State variables
let pdfText = "";
let isWriting = false; // Tracks animation state
const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 3. Handle PDF file selection and extraction (All Pages)
uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            
            let fullText = "";
            // Loop through every page in the PDF
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                
                // Sort by vertical position (top-down)
                const sortedItems = content.items.sort((a, b) => b.transform[5] - a.transform[5]);
                fullText += sortedItems.map(item => item.str).join(" ") + " ";
            }
            
            pdfText = fullText;
            alert("File processed! Touch the notebook to start or stop writing.");
        } catch (error) {
            alert("Error processing PDF: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

// 4. Animation function with Stop/Start control
function startWriting() {
    if (!pdfText) return;

    if (isWriting) {
        // If already writing, stop it
        isWriting = false;
        return;
    }

    isWriting = true;
    output.innerHTML = ""; // Clear existing text
    
    let i = 0;
    function type() {
        if (i < pdfText.length && isWriting) {
            output.innerHTML += pdfText.charAt(i);
            i++;
            // Auto-scroll the notebook
            notebook.scrollTop = notebook.scrollHeight;
            setTimeout(type, 30); 
        } else {
            isWriting = false;
        }
    }
    type();
}

// 5. Trigger events
notebook.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    startWriting();
}, { passive: false });

notebook.addEventListener('click', startWriting);
