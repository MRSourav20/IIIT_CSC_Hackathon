class CertificateParser {
  parse(text) {
    const data = {
      name: null,
      certificate_type: null,
      certificate_number: null,
      issue_date: null
    };

    if (!text) return data;

    const cleanText = text.replace(/\ng/,' ').toLowerCase();

    // 1. Determine Type
    if (/income/i.test(cleanText)) data.certificate_type = 'Income';
    else if (/caste|community/i.test(cleanText)) data.certificate_type = 'Caste';
    else if (/domicile|residence/i.test(cleanText)) data.certificate_type = 'Domicile';

    // 2. Certificate Number (Usually alphanumeric combination with slash or dash)
    const noMatch = cleanText.match(/(?:certificate no|cert no|no)[\s.:]*([A-Z0-9/-]+)/i);
    if (noMatch) {
       data.certificate_number = noMatch[1].toUpperCase();
    }

    // 3. Issue Date
    const dateMatch = cleanText.match(/(?:date|dated)[\s.:]*(\d{2}[-/]\d{2}[-/]\d{4})/i);
    if (dateMatch) {
       data.issue_date = dateMatch[1];
    }

    // 4. Name extraction from sentence (e.g., "This is to certify that Shri/Smt/Kumari <Name>")
    const nameMatch = cleanText.match(/(?:shri|smt|kumari|mr|mrs|ms)[\.\s]+([a-z\s]+)(?:s\/o|d\/o|w\/o|is\s+a)/i);
    if (nameMatch) {
       // Clean up trailing spaces or keywords
       let rawName = nameMatch[1].trim();
       // Uppercase first letters
       rawName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
       data.name = rawName;
    }

    return data;
  }
}

window.CertificateParser = CertificateParser;
