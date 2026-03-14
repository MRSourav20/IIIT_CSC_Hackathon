class FieldMapper {
  constructor() {
    // Defines heuristics for matching random DOM inputs to our strict API data schema
    this.rules = {
      name: {
        keywords: ['name', 'fname', 'first_name', 'applicant', 'citizenname', 'full_name']
      },
      dob: {
        keywords: ['dob', 'birth', 'dateofbirth', 'yob', 'date_of_birth']
      },
      gender: {
        keywords: ['gender', 'sex']
      },
      aadhaar_number: {
        keywords: ['aadhaar', 'uid', 'uidai', 'aadhar']
      },
      pan_number: {
        keywords: ['pan', 'pancard', 'permanent account number']
      }
    };
  }

  detectFieldType(inputElement) {
    if (!inputElement) return null;

    // Build a search string containing all identifying attributes of the field
    const nameAttr = (inputElement.name || "").toLowerCase();
    const idAttr = (inputElement.id || "").toLowerCase();
    const placeholderAttr = (inputElement.placeholder || "").toLowerCase();
    
    // Attempt to find a matching label for the input
    let labelContent = "";
    if (inputElement.id) {
        const label = document.querySelector(`label[for="${inputElement.id}"]`);
        if (label) labelContent = label.innerText.toLowerCase();
    }
    
    const searchString = `${nameAttr} ${idAttr} ${placeholderAttr} ${labelContent}`;

    // Score the inputs against our abstract rules
    for (const [fieldType, rule] of Object.entries(this.rules)) {
        for (const keyword of rule.keywords) {
            // Precise keyword matching within the attributes
            if (searchString.includes(keyword)) {
                return fieldType;
            }
        }
    }

    return null; // Unknown field
  }
}

window.FieldMapper = FieldMapper;
