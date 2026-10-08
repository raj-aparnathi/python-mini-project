/**
 * VaultGuard - UI Controller & Renderer
 * Handles DOM rendering, modal states, independent eye toggles, toasts, and animations.
 */

class UI {
  // Map of revealed row IDs
  static revealedRows = new Set();

  /**
   * Shows a toast notification
   * @param {string} message
   * @param {'success' | 'error' | 'warning' | 'info'} type
   */
  static showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${this.escapeHtml(message)}</div>
      <button class="toast-close-btn" aria-label="Dismiss toast">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove after 3.5s
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
      }
    }, 3500);
  }

  /**
   * Safely copies text to the user's clipboard
   * @param {string} text
   * @param {string} successMsg
   */
  static async copyToClipboard(text, successMsg = 'Copied to clipboard') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      this.showToast(successMsg, 'success');
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      this.showToast('Failed to copy to clipboard', 'error');
    }
  }

  /**
   * Renders the passwords list into the table tbody
   * @param {Array} passwords
   */
  static renderPasswordsTable(passwords) {
    const tbody = document.getElementById('passwordsTbody');
    const table = document.getElementById('passwordsTable');
    const emptyState = document.getElementById('emptyVaultState');
    const countBadge = document.getElementById('tableCountBadge');

    if (!tbody) return;

    if (countBadge) {
      countBadge.textContent = `${passwords.length} item${passwords.length === 1 ? '' : 's'}`;
    }

    if (!passwords || passwords.length === 0) {
      if (table) table.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      tbody.innerHTML = '';
      return;
    }

    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = passwords.map(item => {
      const isRevealed = this.revealedRows.has(item.id);
      const strength = PasswordGenerator.evaluateStrength(item.password);
      const displayPassword = isRevealed ? this.escapeHtml(item.password) : '••••••••••••';
      const initial = (item.website || 'W').charAt(0).toUpperCase();
      const updatedDate = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

      // Eye icon SVGs
      const eyeIconSvg = isRevealed
        ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`
        : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;

      const categoryClass = `badge-${(item.category || 'other').toLowerCase()}`;

      return `
        <tr data-id="${item.id}">
          <!-- Website -->
          <td>
            <div class="item-cell">
              <div class="website-avatar">${initial}</div>
              <div class="item-meta">
                <span class="website-name" title="${this.escapeHtml(item.website)}">${this.escapeHtml(item.website)}</span>
                <span class="website-notes" title="${this.escapeHtml(item.notes || 'No extra notes')}">${this.escapeHtml(item.notes || 'No extra notes')}</span>
              </div>
            </div>
          </td>

          <!-- Username -->
          <td>
            <div class="username-cell">
              <span class="username-text" title="${this.escapeHtml(item.username)}">${this.escapeHtml(item.username)}</span>
              <button class="copy-cell-btn btn-copy-username" data-username="${this.escapeHtml(item.username)}" title="Copy username" aria-label="Copy username for ${this.escapeHtml(item.website)}">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
            </div>
          </td>

          <!-- Password -->
          <td>
            <div class="password-cell">
              <div class="password-display-box">
                <span class="password-text ${isRevealed ? '' : 'masked'}" id="pwd-text-${item.id}">${displayPassword}</span>
              </div>
              <!-- Eye Toggle Button -->
              <button class="eye-toggle-btn btn-toggle-eye" data-id="${item.id}" title="${isRevealed ? 'Hide password' : 'Show password'}" aria-label="${isRevealed ? 'Hide password' : 'Show password'} for ${this.escapeHtml(item.website)}">
                ${eyeIconSvg}
              </button>
              <!-- Copy Password Button -->
              <button class="copy-cell-btn btn-copy-password" data-password="${this.escapeHtml(item.password)}" title="Copy password" aria-label="Copy password for ${this.escapeHtml(item.website)}">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
            </div>
          </td>

          <!-- Category -->
          <td>
            <span class="badge-category ${categoryClass}">
              ${this.escapeHtml(item.category || 'Other')}
            </span>
          </td>

          <!-- Strength -->
          <td>
            <span class="strength-badge strength-${strength.class}">
              ${strength.label}
            </span>
          </td>

          <!-- Last Updated -->
          <td>
            <span style="font-size: 0.8125rem; color: var(--text-muted);">${updatedDate}</span>
          </td>

          <!-- Actions -->
          <td style="text-align: right;">
            <div class="actions-cell" style="justify-content: flex-end;">
              <!-- Favorite Toggle -->
              <button class="action-icon-btn fav-btn ${item.favorite ? 'active' : ''} btn-fav" data-id="${item.id}" title="${item.favorite ? 'Remove from favorites' : 'Mark as favorite'}" aria-label="Favorite ${this.escapeHtml(item.website)}">
                <svg width="17" height="17" fill="${item.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              </button>
              <!-- Edit Button -->
              <button class="action-icon-btn edit-btn btn-edit" data-id="${item.id}" title="Edit password" aria-label="Edit ${this.escapeHtml(item.website)}">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <!-- Delete Button -->
              <button class="action-icon-btn delete-btn btn-delete" data-id="${item.id}" data-website="${this.escapeHtml(item.website)}" title="Delete password" aria-label="Delete ${this.escapeHtml(item.website)}">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Toggles the visibility of a password row independently
   * @param {string} id
   * @param {Array} passwords
   */
  static togglePasswordVisibility(id, passwords) {
    const item = passwords.find(p => p.id === id);
    if (!item) return;

    if (this.revealedRows.has(id)) {
      this.revealedRows.delete(id);
    } else {
      this.revealedRows.add(id);
    }

    // Update single row in place without full re-render
    const pwdSpan = document.getElementById(`pwd-text-${id}`);
    const toggleBtn = document.querySelector(`.btn-toggle-eye[data-id="${id}"]`);

    if (pwdSpan && toggleBtn) {
      const isRevealed = this.revealedRows.has(id);
      pwdSpan.textContent = isRevealed ? item.password : '••••••••••••';
      pwdSpan.className = `password-text ${isRevealed ? '' : 'masked'}`;

      toggleBtn.innerHTML = isRevealed
        ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`
        : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;

      toggleBtn.setAttribute('title', isRevealed ? 'Hide password' : 'Show password');
      toggleBtn.setAttribute('aria-label', `${isRevealed ? 'Hide' : 'Show'} password for ${item.website}`);
    }
  }

  /**
   * Updates all metrics summary cards and sidebar counters
   * @param {Array} passwords
   */
  static updateSummaryCards(passwords) {
    const total = passwords.length;
    let strongCount = 0;
    let weakCount = 0;
    let favCount = 0;

    const catCounts = {
      Social: 0,
      Banking: 0,
      Work: 0,
      Shopping: 0,
      Email: 0,
      Entertainment: 0,
      Other: 0
    };

    passwords.forEach(item => {
      const strength = PasswordGenerator.evaluateStrength(item.password);
      if (strength.label === 'Strong') strongCount++;
      if (strength.label === 'Weak') weakCount++;
      if (item.favorite) favCount++;

      const cat = item.category || 'Other';
      if (catCounts[cat] !== undefined) {
        catCounts[cat]++;
      } else {
        catCounts['Other']++;
      }
    });

    // Update Dashboard Cards
    const elTotal = document.getElementById('statTotalCount');
    const elStrong = document.getElementById('statStrongCount');
    const elWeak = document.getElementById('statWeakCount');
    const elFav = document.getElementById('statFavCount');

    if (elTotal) elTotal.textContent = total;
    if (elStrong) elStrong.textContent = strongCount;
    if (elWeak) elWeak.textContent = weakCount;
    if (elFav) elFav.textContent = favCount;

    // Update Sidebar Badges
    const badgeTotal = document.getElementById('badgeTotalCount');
    const badgeFav = document.getElementById('badgeFavCount');
    if (badgeTotal) badgeTotal.textContent = total;
    if (badgeFav) badgeFav.textContent = favCount;

    for (const [category, count] of Object.entries(catCounts)) {
      const badge = document.getElementById(`badgeCat${category}`);
      if (badge) badge.textContent = count;
    }
  }

  /**
   * Renders recent activity logs in dropdown
   */
  static renderActivityLogs() {
    const list = document.getElementById('notificationList');
    if (!list) return;

    const logs = VaultStorage.getActivityLogs();
    if (logs.length === 0) {
      list.innerHTML = `<li class="notification-item" style="color: var(--text-muted); justify-content: center;">No activity recorded yet</li>`;
      return;
    }

    list.innerHTML = logs.map(l => {
      const time = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <li class="notification-item">
          <div>
            <div class="notification-item-text">${this.escapeHtml(l.text)}</div>
            <div class="notification-item-time">${time}</div>
          </div>
        </li>
      `;
    }).join('');
  }

  /**
   * Opens the Add/Edit Password Modal
   */
  static openPasswordModal(isEdit = false, item = null) {
    const modal = document.getElementById('passwordModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('passwordForm');

    if (!modal || !form) return;

    form.reset();
    this.clearValidationErrors();

    const idInput = document.getElementById('editPasswordId');
    const pwdInput = document.getElementById('formPassword');

    // Reset password field to type="password"
    if (pwdInput) pwdInput.type = 'password';

    if (isEdit && item) {
      title.textContent = 'Edit Password';
      const btnText = document.getElementById('savePasswordBtnText');
      if (btnText) btnText.textContent = 'Save Changes';
      idInput.value = item.id;
      document.getElementById('formWebsite').value = item.website;
      document.getElementById('formUsername').value = item.username;
      document.getElementById('formPassword').value = item.password;
      document.getElementById('formCategory').value = item.category || 'Other';
      document.getElementById('formNotes').value = item.notes || '';
      document.getElementById('formFavorite').checked = Boolean(item.favorite);
      this.updateFormStrengthMeter(item.password);
    } else {
      title.textContent = 'Add New Password';
      const btnText = document.getElementById('savePasswordBtnText');
      if (btnText) btnText.textContent = 'Add Password';
      idInput.value = '';
      this.updateFormStrengthMeter('');
    }

    modal.classList.add('open');
    document.getElementById('formWebsite').focus();
  }

  static closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.classList.remove('open');
  }

  /**
   * Updates the form's strength meter visual feedback
   */
  static updateFormStrengthMeter(password) {
    const bar = document.getElementById('formStrengthBar');
    const text = document.getElementById('formStrengthText');
    const tip = document.getElementById('formStrengthTip');

    if (!bar || !text || !tip) return;

    if (!password) {
      bar.className = 'strength-bar-fill';
      bar.style.width = '0%';
      text.textContent = 'None';
      text.className = 'strength-status-text';
      tip.textContent = 'Enter password';
      return;
    }

    const result = PasswordGenerator.evaluateStrength(password);
    bar.className = `strength-bar-fill ${result.class}`;
    bar.style.width = `${result.score}%`;
    text.textContent = result.label;
    text.className = `strength-status-text ${result.class}`;
    tip.textContent = result.tip;
  }

  /**
   * Clears form validation errors
   */
  static clearValidationErrors() {
    document.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
    document.querySelectorAll('.form-error-msg').forEach(e => e.classList.remove('visible'));
    const feedback = document.getElementById('passwordSecurityFeedback');
    if (feedback) feedback.style.display = 'none';
  }

  /**
   * Renders security criteria feedback list
   * @param {string} prefix ('crit' or 'genCrit')
   * @param {Object} details
   */
  static renderCriteriaFeedback(prefix, details) {
    const criteria = [
      { key: 'Length', valid: details.checks.length, label: 'Length (8+ chars)' },
      { key: 'Upper', valid: details.checks.uppercase, label: 'Uppercase (A-Z)' },
      { key: 'Lower', valid: details.checks.lowercase, label: 'Lowercase (a-z)' },
      { key: 'Number', valid: details.checks.number, label: 'Number (0-9)' },
      { key: 'Special', valid: details.checks.special, label: 'Special character (!@#$)' }
    ];

    criteria.forEach(item => {
      const el = document.getElementById(`${prefix}${item.key}`);
      if (el) {
        el.className = `crit-item ${item.valid ? 'valid' : 'invalid'}`;
        el.innerHTML = `<span class="crit-icon">${item.valid ? '✓' : '✗'}</span> ${item.label}`;
      }
    });
  }

  /**
   * HTML escape helper to prevent XSS
   */
  static escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
