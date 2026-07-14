// ... (imports remain the same) ...

let pdfText = "";
let isWriting = false; // New flag to track animation state

// 3. Handle PDF (Extract all pages)
reader.onload = async function() {
    try {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        
        let fullText = "";
        // Loop through all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const sortedItems = content.items.sort((a, b) => b.transform[5] - a.transform[5]);
            fullText += sortedItems.map(item => item.str).join(" ") + " ";
        }
        
        pdfText = fullText;
        alert("Success! PDF loaded.");
    } catch (error) {
        alert("Error: " + error.message);
    }
};

// 4. Improved Animation
function startWriting() {
    if (!pdfText) return;

    // If already writing, stop it (reset)
    isWriting = false; 
    
    // Use a small delay to ensure the reset happens before starting again
    setTimeout(() => {
        isWriting = true;
        output.innerHTML = "";
        let i = 0;

        function type() {
            if (i < pdfText.length && isWriting) {
                output.innerHTML += pdfText.charAt(i);
                i++;
                // Keep the notebook scrolled to the bottom
                notebook.scrollTop = notebook.scrollHeight;
                setTimeout(type, 30);
            }
        }
        type();
    }, 100);
}

// 5. Touch events
notebook.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isWriting) {
        isWriting = false; // Stop the writing
    } else {
        startWriting(); // Start the writing
    }
}, { passive: false });
