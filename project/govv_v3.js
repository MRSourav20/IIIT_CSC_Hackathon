(function () {
    console.log('AntiGravity AI Co-Pilot content script initialized.');

    const uiPanel = new window.UIPanel();
    const validationEngine = new window.ValidationEngine();
    const apiClient = new window.ApiClient();
    const fieldMapper = new window.FieldMapper();
    const autofillEngine = new window.AutofillEngine(fieldMapper);

    let monitor = null;
    let extractedDocumentData = null;

    // Export for external modules (like BackupEngine)
    window.govvApp = {
        autofill: autofillEngine,
        monitor: null // will be attached when initialized
    };

    function initExtension() {
        uiPanel.inject();
        
        // Define global hook for the UI to call the API
        window.sendTextToAssistant = async (query) => {
            const context = monitor ? `Portal with ${monitor.forms.length} forms` : "Unknown portal";
            return await apiClient.sendTextQuery(query, context);
        };
        
        // Phase 8: Sarvam Voice Assistant Infrastructure
        const speechCapture = new window.SpeechCapture();
        const voicePlayer = new window.VoicePlayer();
        const voiceAssistant = new window.VoiceAssistant(speechCapture, voicePlayer, uiPanel);
        
        monitor = new window.FormMonitor((logData) => {
            console.log('Field changed', logData);
            uiPanel.addLog(logData);
            runValidations();
        });
        window.govvApp.monitor = monitor;

        // Phase 10: Robust Form Tracker System
        if (window.FormStateTracker && window.MutationFormWatcher) {
            const formStateTracker = new window.FormStateTracker();
            window.formStateTracker = formStateTracker; // export for access
            
            const mutationWatcher = new window.MutationFormWatcher(formStateTracker);
            mutationWatcher.start();
        }

        // Set up internal extension file upload listener
        const internalUpload = document.getElementById('antigravity-internal-upload');
        if (internalUpload) {
            internalUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    handleDocumentUpload(e.target);
                    
                    // Reset the file input so the same file can be uploaded again if needed
                    e.target.value = ''; 
                }
            });
        }

        // Set up the Autofill trigger button
        const autofillBtn = document.getElementById('btn-autofill-form');
        if (autofillBtn) {
            autofillBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (extractedDocumentData && monitor && monitor.inputs.length > 0) {
                    const filledCount = autofillEngine.fill(extractedDocumentData, monitor.inputs);
                    console.log(`Auto-filled ${filledCount} fields.`);
                }
            });
        }
        
        // Set up the Ask Assistant trigger button
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                voiceAssistant.handleVoiceRequest(voiceBtn);
            });
        }
        
        // Phase 9: Panda Backup System
        const backupEngine = new window.BackupEngine();
        const backupBtn = document.getElementById('btn-panda-backup');
        
        if (backupBtn) {
            backupBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                backupBtn.innerText = "⏳ Encrypting...";
                
                let formData = {};
                if (window.formStateTracker) {
                    formData = window.formStateTracker.collectFormState();
                    console.log("📦 Packaging robust dynamic state into image:", formData);
                } else if (monitor && monitor.inputs) {
                    // Fallback
                    const inputsArray = Array.from(monitor.inputs);
                    inputsArray.forEach(input => {
                        const semanticKey = window.BackupEngine.findLabelForInput(input);
                        formData[semanticKey] = input.value;
                        input.dataset.antigravityBackupKey = semanticKey; 
                    });
                }
                
                let citizenName = "Citizen";
                if (extractedDocumentData && extractedDocumentData.name) {
                    citizenName = extractedDocumentData.name;
                } else if (formData) {
                    const nameKey = Object.keys(formData).find(k => k.toLowerCase().includes('name'));
                    if (nameKey && formData[nameKey]) citizenName = formData[nameKey];
                }

                try {
                    await backupEngine.createBackup(formData, citizenName);
                    backupBtn.innerText = "✅ Backup Downloaded!";
                    setTimeout(() => backupBtn.innerText = "💾 Create Backup", 3000);
                    
                    const keys = Object.keys(formData);
                    const displayKeys = keys.slice(0, 15);
                    const more = keys.length > 15 ? `\n...and ${keys.length - 15} more fields.` : '';
                    alert(`✅ Panda Backup Saved!\n\nThe AI dynamically scanned this site and stored ${keys.length} fields:\n\n- ${displayKeys.join('\n- ')}${more}`);
                    
                } catch (err) {
                    console.error("Backup failed", err);
                    alert("Backup Failed: " + err.message);
                    backupBtn.innerText = "💾 Create Backup";
                }
            });
        }

        const pandaUpload = document.getElementById('antigravity-panda-upload');
        const pandaPreview = document.getElementById('antigravity-panda-preview');
        const pandaRestoreBtn = document.getElementById('btn-panda-restore');
        let pendingRestorePayload = null;

        if (pandaUpload) {
            pandaUpload.addEventListener('change', async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    pandaPreview.style.display = 'block';
                    pandaPreview.innerHTML = "⏳ Reading Backup...";
                    pandaRestoreBtn.style.display = 'none';
                    
                    try {
                        pendingRestorePayload = await backupEngine.readBackupPreview(e.target.files[0]);
                        const storedKeys = Object.keys(pendingRestorePayload.data).filter(k => pendingRestorePayload.data[k]);
                        
                        pandaPreview.innerHTML = `
                            <strong>✅ Backup Found</strong><br>
                            Citizen Name: ${pendingRestorePayload.citizen_name}<br>
                            Restorable Fields: ${storedKeys.length} (${storedKeys.join(', ')})<br>
                            Backup Time: ${new Date(pendingRestorePayload.timestamp).toLocaleTimeString()}
                        `;
                        pandaRestoreBtn.style.display = 'block';
                    } catch (err) {
                        pandaPreview.innerHTML = `<span style="color: #f38ba8;">Error: ${err.message}</span>`;
                        pendingRestorePayload = null;
                        pandaUpload.value = '';
                    }
                }
            });
        }

        if (pandaRestoreBtn) {
            pandaRestoreBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (pendingRestorePayload) {
                    try {
                        pandaRestoreBtn.innerText = "⏳ Restoring...";
                        await backupEngine.restoreForm(pendingRestorePayload);
                        pandaRestoreBtn.innerText = "✅ Form Restored!";
                        pandaPreview.innerHTML = "";
                        setTimeout(() => {
                            pandaRestoreBtn.style.display = 'none';
                            pandaRestoreBtn.innerText = "🔄 Restore Form";
                            if(pandaUpload) pandaUpload.value = '';
                        }, 3000);
                    } catch (err) {
                        alert("Restore Failed: " + err.message);
                        pandaRestoreBtn.innerText = "🔄 Restore Form";
                    }
                }
            });
        }

        uiPanel.updateStatus(monitor.forms.length);
        runValidations(); // Initial pass
    }

    function runValidations() {
        if (monitor && monitor.inputs.length > 0) {
            const validationResult = validationEngine.validateAll(monitor.inputs);
            
            // Compare extracted OCR data with form data
            let ocrMismatches = [];
            if (extractedDocumentData) {
                monitor.inputs.forEach(input => {
                     const val = input.value.trim().toLowerCase();
                     const inputType = validationEngine.identifyFieldType(input);
                     
                     if (val) {
                         if (inputType === 'aadhaar' && extractedDocumentData.aadhaar_number && 
                             val.replace(/\s/g,'') !== extractedDocumentData.aadhaar_number) {
                              ocrMismatches.push({field: input.name || 'Aadhaar', message: 'Mismatch with uploaded document'});
                         }
                         if (inputType === 'name' && extractedDocumentData.name && 
                             !extractedDocumentData.name.toLowerCase().includes(val)) {
                              // Name heuristics can be tricky, partial matching is best for now
                         }
                     }
                });
            }
            
            // Append OCR mismatches to standard validation warnings
            validationResult.warnings = validationResult.warnings.concat(ocrMismatches);
            
            // Recalculate score if needed based on mismatches
            if (ocrMismatches.length > 0 && validationResult.riskScore === 'Low') {
                validationResult.riskScore = 'Medium';
            }

            uiPanel.updateValidationState(validationResult);
        }
    }

    async function handleDocumentUpload(fileInput) {
        try {
            uiPanel.updateOCRState("Sending to AI Backend...");
            
            const serverResponse = await apiClient.sendDocumentToServer(fileInput.files[0]);
            
            // Server response structure is { type, label, parsedData } based on our custom format mapping in api_client.js
            extractedDocumentData = serverResponse.parsedData;
            
            uiPanel.updateOCRState(`Detected: ${serverResponse.label}`, serverResponse.parsedData);
            
            runValidations(); // Re-run cross-validations with the new remote data
            
            // Phase 6: Automatic Autofill Execution
            if (extractedDocumentData && monitor && monitor.inputs.length > 0) {
                const filledCount = autofillEngine.fill(extractedDocumentData, monitor.inputs);
                console.log(`Deep OCR Automagic: Auto-filled ${filledCount} fields.`);
                uiPanel.updateOCRState(`Auto-Filled ${filledCount} fields mapped from: ${serverResponse.label}`, serverResponse.parsedData);
            }
            
        } catch (error) {
            uiPanel.updateOCRState(`Backend Error: ${error.message}. Is Node.js running?`);
        }
    }

    if (document.body) {
        initExtension();
    } else {
        document.addEventListener('DOMContentLoaded', initExtension);
    }

    // Listen for popup messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'PING') {
            sendResponse({
                status: 'active',
                formsDetected: monitor ? monitor.forms.length : 0
            });
        } else if (message.type === 'TOGGLE_PANEL') {
            uiPanel.toggle();
            sendResponse({ status: 'toggled' });
        } else if (message.type === 'CLEAR_LOGS') {
            uiPanel.clearLogs();
            sendResponse({ status: 'cleared' });
        }
        return true;
    });

    // Periodically detect dynamically added forms (e.g. SPAs like React/Angular)
    setInterval(() => {
        if (monitor) {
            const currentInputCount = document.querySelectorAll('input, select, textarea').length;
            if (currentInputCount !== monitor.inputs.length) {
                monitor.detectForms();
                monitor.attachListeners();
                uiPanel.updateStatus(monitor.forms.length);
                
                // Re-run validation on new fields
                runValidations();
            }
        }
    }, 2000);
})();
