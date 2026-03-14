class AadhaarParser {
  parse(text) {
    const data = {
      name: null,
      dob: null,
      gender: null,
      aadhaar_number: null
    };

    if (!text) return data;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        
        // 1. Aadhaar Number: Look for 4 spaces 4 spaces 4 (or similar block structure)
        const aadhaarMatch = lines[i].match(/(?:\d{4}\s?\d{4}\s?\d{4})/);
        if (aadhaarMatch && !data.aadhaar_number) {
            data.aadhaar_number = aadhaarMatch[0].replace(/\s/g, '');
        }

        // 2. DOB
        const dobMatch = lines[i].match(/(?:DOB|Year of Birth|YOB|DO8)[^\d]*(\d{2}[-/]\d{2}[-/]\d{4}|\d{4})/i);
        if (dobMatch && !data.dob) {
            data.dob = dobMatch[1];
        }

        // 3. Gender
        if (/(?:male|female|transgender|purush|mahila)/i.test(line) && !data.gender) {
            if (/female|mahila/i.test(line)) data.gender = 'Female';
            else if (/male|purush/i.test(line)) data.gender = 'Male';
            else data.gender = 'Transgender';
        }

        // 4. Name: Usually the line *before* DOB or just below Govt of India.
        // Simple heuristic: If it looks like a name (words, no numbers) and we found DOB nearby
        if (!data.name && lines[i].match(/DOB|Year of Birth/i)) {
            // Check lines above for a valid name
            for(let j=1; j<=2; j++) {
                if(i - j >= 0) {
                    const candidateLine = lines[i-j];
                    // If it doesn't contain GOI or numbers, it's likely the name
                    if(!/government|india|father|husband/i.test(candidateLine) && !/\d/.test(candidateLine)) {
                        data.name = candidateLine.replace(/[^a-zA-Z\s.-]/g, '').trim();
                        break;
                    }
                }
            }
        }
    }

    return data;
  }
}

window.AadhaarParser = AadhaarParser;
