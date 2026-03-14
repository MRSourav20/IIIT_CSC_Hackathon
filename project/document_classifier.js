class DocumentClassifier {
  constructor() {
    // Keywords to detect document type
    this.types = {
      aadhaar: {
        keywords: [
           /government\s+of\s+india/i,
           /unique\s+identification\s+authority/i,
           /uidai/i,
           /mera\s+aadhaar/i,
           /vid/i
        ],
        type: 'aadhaar',
        label: 'Aadhaar Card'
      },
      pan: {
        keywords: [
          /income\s+tax\s+department/i,
          /incometax/i,
          /permanent\s+account\s+number/i,
          /signature/i
        ],
        type: 'pan',
        label: 'PAN Card'
      },
      certificate: {
         keywords: [
           /certificate/i,
           /praman\s+patra/i,
           /tehsildar/i,
           /district\s+magistrate/i,
           /income\s+certificate/i,
           /caste\s+certificate/i,
           /domicile\s+certificate/i
         ],
         type: 'certificate',
         label: 'Government Certificate'
      }
    };
  }

  classify(text) {
    if (!text) return { type: 'unknown', label: 'Unknown Document' };
    
    const cleanText = text.replace(/\n/g, ' ').toLowerCase();
    
    let maxScore = 0;
    let detectedType = { type: 'unknown', label: 'Unknown Document' };

    for (const [key, docdef] of Object.entries(this.types)) {
       let score = 0;
       for (const regex of docdef.keywords) {
         if (regex.test(cleanText)) {
           score++;
         }
       }
       
       if (score > maxScore) {
         maxScore = score;
         detectedType = { type: docdef.type, label: docdef.label };
       }
    }

    // Need at least 1 keyword match to classify
    if (maxScore > 0) return detectedType;
    return { type: 'unknown', label: 'Unknown Document' };
  }
}

window.DocumentClassifier = DocumentClassifier;
