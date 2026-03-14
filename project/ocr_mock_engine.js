class OCREngine {
  constructor() {
     console.log("Initializing AntiGravity OCR stub engine...");
  }

  // Simulate OCR text extraction for local testing without external CDN dependencies
  async processImage(fileElement, progressCallback) {
    if (!fileElement.files || fileElement.files.length === 0) {
      throw new Error("No file selected for OCR.");
    }

    const file = fileElement.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      throw new Error("Unsupported file type. Please upload JPG or PNG.");
    }

    return new Promise((resolve) => {
        let progress = 0;
        
        // Simulate reading progress
        const interval = setInterval(() => {
            progress += 20;
            if (progressCallback) progressCallback(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // Return a heavily mocked string that will successfully trigger the parsers 
                // and the DocumentClassifier to prove out the pipeline.
                const mockOCRText = `
                    GOVERNMENT OF INDIA
                    UNIQUE IDENTIFICATION AUTHORITY
                    Name: Srita
                    DOB: 12/05/1990
                    Gender: Female
                    9876 5432 1098
                    VID: 1234 5678 9012 3456
                `;
                resolve(mockOCRText);
            }
        }, 500); // 2.5 second simulated delay
    });
  }
}

window.OCREngine = OCREngine;
