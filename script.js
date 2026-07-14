import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

let fullText = "";

document.getElementById('pdf-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const page = await pdf.getPage(1); // Get first page
        const content = await page.getTextContent();
        fullText = content.items.map(item => item.str).join(" ");
    };
    reader.readAsArrayBuffer(file);
});

const notebook = document.getElementById('notebook');
const output = document.getElementById('handwriting-output');

// Trigger on touch or click
notebook.addEventListener('touchstart', startWriting);
notebook.addEventListener('click', startWriting);

function startWriting() {
    if (!fullText) return alert("Please upload a PDF first!");
    output.innerHTML = ""; // Clear
    let i = 0;
    function type() {
        if (i < fullText.length) {
            output.innerHTML += fullText.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    type();
}
