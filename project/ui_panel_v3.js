class UIPanel {
  constructor() {
    this.panel = null;
    this.logsContainer = null;
  }

  inject() {
    if (document.getElementById('antigravity-assistant-panel')) {
      return; // Prevent duplicate injection
    }

    this.panel = document.createElement('div');
    this.panel.id = 'antigravity-assistant-panel';

    this.panel.innerHTML = `
      <div id="antigravity-panel-header">
        <span>🤖 AntiGravity AI Co-Pilot</span>
        <button id="antigravity-panel-close">&times;</button>
      </div>
      <div id="antigravity-panel-content">
        <div class="antigravity-section">
          <div class="antigravity-section-title">AI Assistant & Status</div>
          <div id="antigravity-form-status" style="margin-bottom: 8px;">Scanning...</div>
          
          <div id="antigravity-chat-history" style="max-height: 120px; overflow-y: auto; font-size: 11px; margin-bottom: 8px; border: 1px solid #45475a; padding: 5px; border-radius: 4px; background: #181825;">
            <div style="color: #6c7086; font-style: italic;">Ask me anything or use voice...</div>
          </div>
          
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            <input type="text" id="antigravity-chat-input" placeholder="Type query..." style="flex: 1; background: #313244; border: 1px solid #45475a; color: #cdd6f4; padding: 4px 6px; border-radius: 4px; font-size: 11px;" />
            <button id="btn-chat-send" class="antigravity-btn antigravity-btn-primary" style="padding: 4px 8px; font-size: 11px;">Send</button>
          </div>
          
          <button id="voiceBtn" class="antigravity-btn antigravity-btn-primary" style="width: 100%; background-color: #8839ef; border-color: #8839ef;">🎤 Pulse Voice Search</button>
        </div>
        
        <div class="antigravity-section">
          <div class="antigravity-section-title">Document AI</div>
          
          <div id="antigravity-upload-area" class="antigravity-upload-zone">
            <span style="font-size: 11px;">Drop ID Image Here</span>
            <input type="file" id="antigravity-internal-upload" accept="image/*" />
          </div>
          
          <div id="antigravity-ocr-status" style="margin-top: 5px;"></div>
          <div id="antigravity-ocr-data" style="margin-top: 5px;"></div>
          <div id="antigravity-autofill-container" style="display: none; margin-top: 8px;">
              <button id="btn-autofill-form" class="antigravity-btn antigravity-btn-primary" style="width: 100%;">⚡ Autofill Form</button>
          </div>
        </div>

        <div class="antigravity-section">
          <div class="antigravity-section-title">Panda Backup (Offline)</div>
          <button id="btn-panda-backup" class="antigravity-btn antigravity-btn-primary" style="width: 100%; margin-bottom: 5px; background-color: #a6e3a1; color: #11111b;">💾 Create Backup</button>
          
          <div id="antigravity-restore-area" class="antigravity-upload-zone" style="margin-bottom: 5px;">
            <span style="font-size: 11px;">Upload Panda Image to Restore</span>
            <input type="file" id="antigravity-panda-upload" accept="image/png" />
          </div>
          
          <div id="antigravity-panda-preview" style="font-size: 12px; margin-bottom: 5px; display: none;"></div>
          <button id="btn-panda-restore" class="antigravity-btn antigravity-btn-primary" style="width: 100%; display: none; background-color: #f9e2af; color: #11111b;">🔄 Restore Form</button>
        </div>

        <div class="antigravity-section">
          <div class="antigravity-section-title">Detected Issues</div>
          <div id="antigravity-validation-container">
            <div class="antigravity-placeholder">No issues detected.</div>
          </div>
        </div>

        <div class="antigravity-section">
          <div class="antigravity-section-title">Risk Score</div>
          <div id="antigravity-risk-score" class="risk-low">Low</div>
        </div>

        <div class="antigravity-section">
          <div class="antigravity-section-title">Field Logs</div>
          <div id="antigravity-logs-container">
            <div class="antigravity-placeholder">No changes detected yet.</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.logsContainer = document.getElementById('antigravity-logs-container');
    this.validationContainer = document.getElementById('antigravity-validation-container');
    this.riskScoreEl = document.getElementById('antigravity-risk-score');
    this.chatHistoryEl = document.getElementById('antigravity-chat-history');
    this.chatInputEl = document.getElementById('antigravity-chat-input');


    this.ocrStatusEl = document.getElementById('antigravity-ocr-status');
    this.ocrDataEl = document.getElementById('antigravity-ocr-data');

    // Attach listeners
    document.getElementById('antigravity-panel-close').addEventListener('click', () => {
      this.toggle(false);
    });

    document.getElementById('btn-chat-send').addEventListener('click', () => this.handleChatSubmit());
    this.chatInputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleChatSubmit();
    });
  }

  async handleChatSubmit() {
    const query = this.chatInputEl.value.trim();
    if (!query) return;

    this.addChatMessage('Operator', query);
    this.chatInputEl.value = '';

    try {
      if (window.sendTextToAssistant) {
        const result = await window.sendTextToAssistant(query);
        this.addChatMessage('Assistant', result.response, result.links);
      }
    } catch (err) {
      this.addChatMessage('System', 'Error: ' + err.message);
    }
  }

  addChatMessage(sender, text, links = []) {
    if (!this.chatHistoryEl) return;
    
    // Remove tutorial text if it's there
    if (this.chatHistoryEl.querySelector('div[style*="italic"]')) {
      this.chatHistoryEl.innerHTML = '';
    }

    const msgEl = document.createElement('div');
    msgEl.style.marginBottom = '8px';
    msgEl.innerHTML = `<strong>${sender}:</strong> ${text}`;
    
    if (links && links.length > 0) {
      const linksContainer = document.createElement('div');
      linksContainer.style.marginTop = '4px';
      linksContainer.style.display = 'flex';
      linksContainer.style.flexWrap = 'wrap';
      linksContainer.style.gap = '5px';
      
      links.forEach(link => {
        const linkBtn = document.createElement('button');
        linkBtn.className = 'antigravity-btn';
        linkBtn.style.fontSize = '10px';
        linkBtn.style.padding = '2px 6px';
        linkBtn.style.background = '#45475a';
        linkBtn.innerText = link.title;
        linkBtn.onclick = () => {
          chrome.runtime.sendMessage({ type: 'OPEN_LINK', url: link.url });
        };
        linksContainer.appendChild(linkBtn);
      });
      msgEl.appendChild(linksContainer);
    }

    this.chatHistoryEl.appendChild(msgEl);
  }

  updateOCRState(statusText, parsedData = null) {
    if (!this.ocrStatusEl) return;
    this.ocrStatusEl.innerHTML = `<strong>${statusText}</strong>`;

    if (parsedData) {
      let html = '<div class="antigravity-extracted-data">';
      for (const [key, value] of Object.entries(parsedData)) {
        if (value) {
          html += `<div><span class="antigravity-data-key">${key}:</span> ${value}</div>`;
        }
      }
      html += '</div>';
      this.ocrDataEl.innerHTML = html;
      
      const autofillContainer = document.getElementById('antigravity-autofill-container');
      if (autofillContainer) autofillContainer.style.display = 'block';
    } else {
      this.ocrDataEl.innerHTML = '';
      
      const autofillContainer = document.getElementById('antigravity-autofill-container');
      if (autofillContainer) autofillContainer.style.display = 'none';
    }
  }

  updateValidationState(validationResult, ocrMismatches = []) {
    if (!this.validationContainer || !this.riskScoreEl) return;

    // Update Warnings
    if (validationResult.warnings.length === 0) {
      this.validationContainer.innerHTML = '<div class="antigravity-placeholder">No issues detected.</div>';
    } else {
      this.validationContainer.innerHTML = '';
      validationResult.warnings.forEach(w => {
        const warningEl = document.createElement('div');
        warningEl.className = 'antigravity-warning-entry';
        warningEl.innerHTML = `<span>⚠ ${w.message}</span> <span class="warning-field">(${w.field})</span>`;
        this.validationContainer.appendChild(warningEl);
      });
    }

    // Update Risk Score
    this.riskScoreEl.innerText = validationResult.riskScore;
    this.riskScoreEl.className = `risk-${validationResult.riskScore.toLowerCase()}`;
  }

  updateStatus(formsCount) {
    const statusEl = document.getElementById('antigravity-form-status');
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: #a6e3a1;">Active</span> - ${formsCount} form(s) active`;
    }
  }

  addLog(data) {
    if (!this.logsContainer) return;

    // Remove placeholder
    const placeholder = this.logsContainer.querySelector('.antigravity-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    const logEntry = document.createElement('div');
    logEntry.className = 'antigravity-log-entry';
    logEntry.innerHTML = `
      <div style="font-size: 11px; margin-bottom: 2px;">Field changed</div>
      <span class="antigravity-tag">${data.type}</span> 
      <strong>Name:</strong> ${data.name}<br/>
      <strong>Value:</strong> ${data.value}
    `;

    this.logsContainer.appendChild(logEntry);
    this.logsContainer.scrollTop = this.logsContainer.scrollHeight; // Auto-scroll to bottom
  }

  clearLogs() {
    if (this.logsContainer) {
      this.logsContainer.innerHTML = '<div class="antigravity-placeholder">No changes detected yet.</div>';
    }
  }

  toggle(forceState) {
    if (this.panel) {
      if (typeof forceState !== 'undefined') {
        if (forceState) {
          this.panel.classList.remove('hidden');
        } else {
          this.panel.classList.add('hidden');
        }
      } else {
        this.panel.classList.toggle('hidden');
      }
    }
  }
}

// Make accessible in content.js context
window.UIPanel = UIPanel;
