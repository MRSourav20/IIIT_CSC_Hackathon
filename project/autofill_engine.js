class AutofillEngine {
  constructor(fieldMapper) {
    this.mapper = fieldMapper;
  }

  fill(extractedData, monitorInputs) {
      if (!extractedData || !monitorInputs) return 0;
      
      let fieldsFilled = 0;

      monitorInputs.forEach((input) => {
          // Skip fields that already have data or are not text/number inputs
          if (input.value && input.value.trim() !== '') return;
          if (input.type && ['file', 'submit', 'button', 'hidden', 'checkbox', 'radio'].includes(input.type)) return;

          const targetType = this.mapper.detectFieldType(input);

          if (targetType && extractedData[targetType]) {
              // We have a match and data exists!
              const valueToInject = extractedData[targetType];

              // Check if we are interacting with a Date input that requires YYYY-MM-DD format
              if (input.type === 'date' && valueToInject.includes('/')) {
                  // Assuming incoming format is DD/MM/YYYY or MM/DD/YYYY
                  const parts = valueToInject.split('/');
                  if (parts.length === 3) {
                      // Attempt a basic reformat assuming DD/MM/YYYY based on Aadhaar standard
                      const formatted = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                      input.value = formatted;
                  } else {
                      input.value = valueToInject;
                  }
              } else {
                  input.value = valueToInject;
              }
              
              // CRITICAL: Dispatch native events so modern frameworks (React/Vue/Angular) 
              // register that the field was modified programmatically.
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));

              // Visually highlight that the AI filled this field
              input.style.backgroundColor = '#e6fffa'; // Light mint green
              input.style.border = '1px solid #38bdf8'; // Blue highlight
              
              // Reset visual after 3 seconds
              setTimeout(() => {
                  input.style.backgroundColor = '';
                  input.style.border = '';
              }, 3000);

              fieldsFilled++;
          }
      });

      return fieldsFilled;
  }
}

window.AutofillEngine = AutofillEngine;
