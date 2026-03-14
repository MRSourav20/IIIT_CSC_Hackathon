class PANParser {
  parse(text) {
    const data = {
      name: null,
      dob: null,
      pan_number: null
    };

    if (!text) return data;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. PAN Number Format: 5 Letters, 4 Numbers, 1 Letter (e.g. ABCDE1234F)
        const panMatch = line.match(/([A-Z]{5}\d{4}[A-Z]{1})/i);
        if (panMatch && !data.pan_number) {
            data.pan_number = panMatch[1].toUpperCase();
        }

        // 2. DOB Match (DD/MM/YYYY)
        const dobMatch = line.match(/(\d{2}[-/]\d{2}[-/]\d{4})/);
        if (dobMatch && !data.dob && !/incometax/i.test(line)) {
            data.dob = dobMatch[1];
        }

        // 3. Name Match: Heuristic - Usually right below Income Tax Dept or Govt of India
        // Or above the father's name.
        if (!data.name && /(?:income\s+tax\s+department|govt\.\s+of\s+india)/i.test(line)) {
            // Check lines below
            for(let j=1; j<=3; j++) {
                if(i + j < lines.length) {
                    const candidateLine = lines[i+j];
                    // Skip empty or obvious non-name lines
                    if (candidateLine.length > 2 && !/\d/.test(candidateLine) && candidateLine.split(' ').length <= 4) {
                       data.name = candidateLine.replace(/[^a-zA-Z\s]/g, '').trim();
                       break;
                    }
                }
            }
        }
    }

    return data;
  }
}

window.PANParser = PANParser;
