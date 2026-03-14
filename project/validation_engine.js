class ValidationEngine {
    constructor() {
        this.rules = {
            aadhaar: {
                pattern: /^\d{12}$/,
                message: "Invalid Aadhaar number format",
                detect: (name, placeholder) => /aadhaar|uidai|uid/i.test(name) || /aadhaar|uidai|uid/i.test(placeholder)
            },
            name: {
                pattern: /^[a-zA-Z\s.-]+$/,
                message: "Name field appears invalid",
                detect: (name, placeholder) => /name|applicant/i.test(name) || /name|applicant/i.test(placeholder)
            },
            dob: {
                // Simple YYYY-MM-DD or DD/MM/YYYY detection logic
                customCheck: (value) => {
                    if (!value) return true; // Handled by required check

                    // Try parsing standard date
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        // Try split for DD/MM/YYYY or DD-MM-YYYY
                        const parts = value.split(/[-/]/);
                        if (parts.length === 3) {
                            const [d, m, y] = parts;
                            // Very basic heuristic check
                            if (y.length === 4 && parseInt(y) > 1900 && parseInt(y) <= new Date().getFullYear()) {
                                return true;
                            }
                        }
                        return false;
                    }

                    // Check if future date
                    if (date > new Date()) return false;

                    // Check if unreasonably old (e.g. > 120 years)
                    const age = new Date().getFullYear() - date.getFullYear();
                    if (age > 120) return false;

                    return true;
                },
                message: "Invalid date of birth",
                detect: (name, placeholder) => /dob|birth|date/i.test(name) || /dob|birth|date/i.test(placeholder)
            }
        };
    }

    // Identifies the field type based on heuristics
    identifyFieldType(inputElement) {
        const name = inputElement.name || inputElement.id || '';
        const placeholder = inputElement.placeholder || '';

        for (const [type, rule] of Object.entries(this.rules)) {
            if (rule.detect(name, placeholder)) {
                return type;
            }
        }
        return 'unknown';
    }

    // Validates a single input element
    validateField(inputElement) {
        const type = this.identifyFieldType(inputElement);
        const value = inputElement.value.trim();
        const warnings = [];

        // 1. Required field check for critical heuristic types
        const criticalTypes = ['name', 'aadhaar', 'dob'];
        if (criticalTypes.includes(type) && !value) {
            warnings.push({
                field: inputElement.name || inputElement.id || 'Unknown',
                type: type,
                message: "Required field missing"
            });
            return warnings; // Don't run format checks if empty
        }

        if (!value) return warnings; // Skip format checks for empty non-critical fields

        // 2. Format checks
        const rule = this.rules[type];
        if (rule) {
            if (rule.pattern && !rule.pattern.test(value)) {
                warnings.push({
                    field: inputElement.name || inputElement.id || 'Unknown',
                    type: type,
                    message: rule.message
                });
            } else if (rule.customCheck && !rule.customCheck(value)) {
                warnings.push({
                    field: inputElement.name || inputElement.id || 'Unknown',
                    type: type,
                    message: rule.message
                });
            }
        }

        // Generic validations for 'unknown' types could go here

        return warnings;
    }

    // Validates an array of forms or inputs, returns aggregated results
    validateAll(inputs) {
        let allWarnings = [];
        inputs.forEach(input => {
            // Ignore hidden fields, buttons, etc.
            if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;

            const warnings = this.validateField(input);
            allWarnings = allWarnings.concat(warnings);
        });

        return {
            warnings: allWarnings,
            riskScore: this.calculateRiskScore(allWarnings)
        };
    }

    calculateRiskScore(warnings) {
        if (warnings.length === 0) return 'Low';
        if (warnings.length <= 2) return 'Medium';
        return 'High';
    }
}

// Attach to window for content scripts
window.ValidationEngine = ValidationEngine;
