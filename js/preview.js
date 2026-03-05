// Preview Module - Show PDF pages before downloading

let currentPreviewDoc = null;
let currentPreviewFilename = '';

function showPreview(doc, filename) {
    currentPreviewDoc = doc;
    currentPreviewFilename = filename;

    const modal = document.getElementById('preview-modal');
    const container = document.getElementById('preview-pages');
    container.innerHTML = '';

    // Get PDF as array buffer and render pages using pdf.js-like approach
    // Since we don't have pdf.js, we'll convert to images via blob URL
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);

    // Show iframe preview (most compatible approach without extra libraries)
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    container.appendChild(iframe);

    modal.style.display = 'flex';
}

function closePreview() {
    const modal = document.getElementById('preview-modal');
    modal.style.display = 'none';
    const container = document.getElementById('preview-pages');
    container.innerHTML = '';
    if (currentPreviewDoc) {
        currentPreviewDoc = null;
    }
}

function downloadFromPreview() {
    if (currentPreviewDoc) {
        currentPreviewDoc.save(currentPreviewFilename);
    }
    closePreview();
}

// Wrap generation functions to optionally preview
function wrapWithPreview(originalFn, progressId) {
    return async function(...args) {
        // Store original doc.save
        const { jsPDF } = window.jspdf;
        const origSave = jsPDF.prototype.save;
        let capturedDoc = null;
        let capturedFilename = '';

        jsPDF.prototype.save = function(filename) {
            capturedDoc = this;
            capturedFilename = filename;
        };

        try {
            await originalFn.apply(this, args);
        } finally {
            jsPDF.prototype.save = origSave;
        }

        if (capturedDoc) {
            showPreview(capturedDoc, capturedFilename);
        }
    };
}
