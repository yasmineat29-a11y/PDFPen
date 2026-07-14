// 1. Import PDF.js from CDN
import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

// 2. State variables
let pdfText = "";
const output = document.getElementById('handwriting-output');
const notebook = document.getElementById('notebook');
const uploadBtn = document.getElementById('pdf-upload');

// 3. Handle PDF file selection and extraction
uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        
        try {
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const page = await pdf.getPage(1); // Extract from first page
            const content = await page.getTextContent();
            
            // Join all text items into one string
            pdfText = content.items.map(item => item.str).join(" ");
            alert("File loaded! Now touch the notebook to start writing.");
        } catch (error) {
            console.error("Error loading PDF: ", error);
            alert("Failed to load PDF.");
        }
    };
    reader.readAsArrayBuffer(file);
});

// 4. Animation function
function startWriting() {
    if (!pdfText) {
        alert("Please upload a PDF file first!");
        return;
    }
    
    // Clear previous text
    output.innerHTML = ""; 
    
    let i = 0;
    function type() {
        if (i < pdfText.length) {
            output.innerHTML += pdfText.charAt(i);
            i++;
            // Adjust speed here (30ms per letter)
            setTimeout(type, 30); 
        }
    }
    type();
}

// 5. Trigger on touch (mobile) or click (desktop)
notebook.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents double-firing on some mobile browsers
    startWriting();
});

notebook.addEventListener('click', startWriting);
// ... keep your imports ...

uploadBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) {
        console.log("No file selected.");
        return;
    }
    console.log("File detected:", file.name);

    const reader = new FileReader();
    reader.onload = async function() {
        console.log("File loaded into memory, starting PDF processing...");
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            console.log("PDF loaded. Pages:", pdf.numPages);
            
            const page = await pdf.getPage(1);
            const content = await page.getTextContent();
            
            // Check if text items exist
            console.log("Content items found:", content.items.length);
            pdfText = content.items.map(item => item.str).join(" ");
            
            console.log("Extracted text (first 50 chars):", pdfText.substring(0, 50));
            alert("File processed! Text ready.");
        } catch (error) {
            console.error("Error processing PDF:", error);
            alert("Error: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

