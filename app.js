/**
 * VaultGuard - Main Application Controller
 * Handles initialization, event delegation, search & filter pipeline, and user actions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  let allPasswords = [];
  let currentFilter = {
    search: '',
    category: 'all',
    strength: 'all',
    view: 'dashboard', // 'dashboard' | 'all' | 'favorites' | specific category
    sort: 'newest'
  };

  let deleteTargetId = null;

  // Initialize
  function init() {
    loadData();
    setupEventListeners();
    updateUI();
  }

  function loadData() {
    allPasswords = VaultStorage.getPasswords();
  }

  function updateUI() {
    UI.updateSummaryCards(allPasswords);
    applyFiltersAndRender();
    UI.renderActivityLogs();
  }

  /**
   * Filters and sorts password entries according to state
   */
  function applyFiltersAndRender() {
    let filtered = [...allPasswords];

    // Toggle Dashboard-only widgets: only visible on Dashboard view
    const dashboardOverview = document.getElementById('dashboardOverview');
    if (dashboardOverview) {
      dashboardOverview.style.display = (currentFilter.view === 'dashboard') ? 'flex' : 'none';
    }

    // Filter by view & category
    if (currentFilter.view === 'favorites') {
      filtered = filtered.filter(p => p.favorite);
      if (currentFilter.category !== 'all') {
        filtered = filtered.filter(p => (p.category || 'Other').toLowerCase() === currentFilter.category.toLowerCase());
      }
    } else {
      const activeCat = currentFilter.category !== 'all'
        ? currentFilter.category
        : (currentFilter.view !== 'dashboard' && currentFilter.view !== 'all' ? currentFilter.view : 'all');
      if (activeCat !== 'all') {
        filtered = filtered.filter(p => (p.category || 'Other').toLowerCase() === activeCat.toLowerCase());
      }
    }

    // Filter by strength
    if (currentFilter.strength !== 'all') {
      filtered = filtered.filter(p => {
        const rating = PasswordGenerator.evaluateStrength(p.password);
        return rating.label.toLowerCase() === currentFilter.strength.toLowerCase();
      });
    }

    // Filter by search query
    if (currentFilter.search.trim()) {
      const q = currentFilter.search.trim().toLowerCase();
      filtered = filtered.filter(p =>
        (p.website || '').toLowerCase().includes(q) ||
        (p.username || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.notes || '').toLowerCase().includes(q)
      );
    }

    // Sort entries
    if (currentFilter.sort === 'newest') {
      filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    } else if (currentFilter.sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (currentFilter.sort === 'alphaAsc') {
      filtered.sort((a, b) => (a.website || '').localeCompare(b.website || ''));
    } else if (currentFilter.sort === 'alphaDesc') {
      filtered.sort((a, b) => (b.website || '').localeCompare(a.website || ''));
    }

    // Update empty state text if search resulted in 0
    const emptyState = document.getElementById('emptyVaultState');
    const emptyHeading = document.getElementById('emptyHeadingText');
    const emptySubtext = document.getElementById('emptySubText');

    if (filtered.length === 0) {
      if (currentFilter.search.trim() || currentFilter.category !== 'all' || currentFilter.strength !== 'all') {
        if (emptyHeading) emptyHeading.textContent = 'No matching passwords found';
        if (emptySubtext) emptySubtext.textContent = 'Try adjusting your search query or clearing the active filters.';
      } else {
        if (emptyHeading) emptyHeading.textContent = 'No passwords saved yet';
        if (emptySubtext) emptySubtext.textContent = 'Start protecting your credentials by adding your first password.';
      }
    }

    UI.renderPasswordsTable(filtered);
  }

  /**
   * Sets up all DOM Event Listeners
   */
  function setupEventListeners() {
    // 1. Navigation & Views
    const navItems = document.querySelectorAll('.nav-item-btn[data-view], .nav-item-btn[data-category]');
    navItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        navItems.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const view = btn.dataset.view;
        const cat = btn.dataset.category;

        const title = document.getElementById('navbarPageTitle');
        const subtitle = document.getElementById('navbarSubtitle');
        const tableTitle = document.getElementById('tableSectionTitle');

        if (view) {
          currentFilter.view = view;
          currentFilter.category = 'all';
          // Sync category tabs
          syncCategoryTabs('all');

          if (view === 'dashboard') {
            title.textContent = 'Password Dashboard';
            subtitle.textContent = 'Manage and safeguard your credentials';
            tableTitle.textContent = 'Saved Passwords';
          } else if (view === 'all') {
            title.textContent = 'All Passwords';
            subtitle.textContent = 'Complete inventory of your saved accounts';
            tableTitle.textContent = 'All Vault Credentials';
          } else if (view === 'favorites') {
            title.textContent = 'Favorites';
            subtitle.textContent = 'Frequently accessed secure credentials';
            tableTitle.textContent = 'Starred Passwords';
          }
        } else if (cat) {
          currentFilter.view = cat;
          currentFilter.category = cat;
          syncCategoryTabs(cat);
          title.textContent = `${cat} Accounts`;
          subtitle.textContent = `Vault credentials organized under ${cat}`;
          tableTitle.textContent = `${cat} Credentials`;
        }

        applyFiltersAndRender();
        closeMobileSidebar();
      });
    });

    // 2. Category Tabs
    const tabBtns = document.querySelectorAll('.category-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const tab = btn.dataset.tab;
        currentFilter.category = tab;
        if (currentFilter.view !== 'favorites') {
          if (tab === 'all') {
            const isDashboardActive = document.getElementById('navDashboard')?.classList.contains('active');
            currentFilter.view = isDashboardActive ? 'dashboard' : 'all';
          } else {
            currentFilter.view = tab;
          }
        }
        const catSelect = document.getElementById('filterCategorySelect');
        if (catSelect) catSelect.value = tab;
        syncCategoryTabs(tab);
        applyFiltersAndRender();
      });
    });

    function syncCategoryTabs(catVal) {
      tabBtns.forEach(b => {
        const matches = b.dataset.tab.toLowerCase() === catVal.toLowerCase();
        b.classList.toggle('active', matches);
        b.setAttribute('aria-selected', matches ? 'true' : 'false');
      });
      const catSelect = document.getElementById('filterCategorySelect');
      if (catSelect) catSelect.value = catVal;

      // Also sync sidebar active indicator
      const navItems = document.querySelectorAll('.nav-item-btn[data-view], .nav-item-btn[data-category]');
      navItems.forEach(b => {
        if (catVal === 'all') {
          if (currentFilter.view === 'favorites') {
            b.classList.toggle('active', b.dataset.view === 'favorites');
          } else if (currentFilter.view === 'all') {
            b.classList.toggle('active', b.dataset.view === 'all');
          } else if (currentFilter.view === 'dashboard') {
            b.classList.toggle('active', b.dataset.view === 'dashboard');
          }
        } else {
          b.classList.toggle('active', b.dataset.category && b.dataset.category.toLowerCase() === catVal.toLowerCase());
        }
      });
    }

    // 3. Search Bar
    const searchInput = document.getElementById('navbarSearchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentFilter.search = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = e.target.value ? 'block' : 'none';
        }
        applyFiltersAndRender();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          currentFilter.search = '';
          searchClearBtn.style.display = 'none';
          applyFiltersAndRender();
          searchInput.focus();
        }
      });
    }

    // Keyboard shortcut "/" to focus search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });

    // 4. Filter dropdowns
    const filterCatSelect = document.getElementById('filterCategorySelect');
    if (filterCatSelect) {
      filterCatSelect.addEventListener('change', (e) => {
        currentFilter.category = e.target.value;
        syncCategoryTabs(e.target.value);
        applyFiltersAndRender();
      });
    }

    const filterStrSelect = document.getElementById('filterStrengthSelect');
    if (filterStrSelect) {
      filterStrSelect.addEventListener('change', (e) => {
        currentFilter.strength = e.target.value;
        applyFiltersAndRender();
      });
    }

    const sortBySelect = document.getElementById('sortBySelect');
    if (sortBySelect) {
      sortBySelect.addEventListener('change', (e) => {
        currentFilter.sort = e.target.value;
        applyFiltersAndRender();
      });
    }

    // 5. Add Password Modal Openers
    const topAddBtn = document.getElementById('topAddPasswordBtn');
    const emptyAddBtn = document.getElementById('emptyAddBtn');

    if (topAddBtn) topAddBtn.addEventListener('click', () => UI.openPasswordModal(false));
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => UI.openPasswordModal(false));

    // Modal Close buttons
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', UI.closePasswordModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', UI.closePasswordModal);

    // Form Password Eye toggle
    const pwdInput = document.getElementById('formPassword');
    const formPwdToggleBtn = document.getElementById('formPasswordToggleBtn');
    if (formPwdToggleBtn && pwdInput) {
      formPwdToggleBtn.addEventListener('click', () => {
        const isPassword = pwdInput.type === 'password';
        pwdInput.type = isPassword ? 'text' : 'password';
        const eyeIcon = document.getElementById('formEyeIcon');
        if (eyeIcon) {
          eyeIcon.innerHTML = isPassword
            ? `<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>`
            : `<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`;
        }
      });
    }

    // Realtime Password Strength on input
    if (pwdInput) {
      pwdInput.addEventListener('input', (e) => {
        UI.updateFormStrengthMeter(e.target.value);
        const feedbackBox = document.getElementById('passwordSecurityFeedback');
        if (feedbackBox && feedbackBox.style.display !== 'none') {
          const details = PasswordGenerator.checkPasswordDetails(e.target.value);
          UI.renderCriteriaFeedback('crit', details);
        }
      });
    }

    // Check Password Button in Form
    const checkPasswordBtn = document.getElementById('checkPasswordBtn');
    if (checkPasswordBtn && pwdInput) {
      checkPasswordBtn.addEventListener('click', () => {
        const val = pwdInput.value;
        if (!val) {
          UI.showToast('Please enter a password to check', 'warning');
          pwdInput.focus();
          return;
        }
        const details = PasswordGenerator.checkPasswordDetails(val);
        UI.updateFormStrengthMeter(val);
        const feedbackBox = document.getElementById('passwordSecurityFeedback');
        if (feedbackBox) {
          feedbackBox.style.display = 'block';
          UI.renderCriteriaFeedback('crit', details);
        }
        UI.showToast(`Password Strength: ${details.strength}`, details.strength === 'Strong' ? 'success' : details.strength === 'Medium' ? 'warning' : 'error');
      });
    }

    // Modal Quick Generate Button
    const modalQuickGenBtn = document.getElementById('modalQuickGenBtn');
    if (modalQuickGenBtn && pwdInput) {
      modalQuickGenBtn.addEventListener('click', () => {
        const generated = PasswordGenerator.generate({ length: 16 });
        pwdInput.value = generated;
        pwdInput.type = 'text'; // Make it visible briefly so user sees the generated pass
        UI.updateFormStrengthMeter(generated);
        UI.showToast('Strong password generated', 'info');
      });
    }

    // 6. Form Submission (Add / Edit)
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        UI.clearValidationErrors();

        const id = document.getElementById('editPasswordId').value;
        const website = document.getElementById('formWebsite').value.trim();
        const username = document.getElementById('formUsername').value.trim();
        const password = document.getElementById('formPassword').value;
        const category = document.getElementById('formCategory').value;
        const notes = document.getElementById('formNotes').value.trim();
        const favorite = document.getElementById('formFavorite').checked;

        // Validation
        let hasError = false;
        if (!website) {
          document.getElementById('formWebsite').classList.add('error');
          document.getElementById('errorWebsite').classList.add('visible');
          hasError = true;
        }
        if (!username) {
          document.getElementById('formUsername').classList.add('error');
          document.getElementById('errorUsername').classList.add('visible');
          hasError = true;
        }
        if (!password) {
          document.getElementById('formPassword').classList.add('error');
          document.getElementById('errorPassword').classList.add('visible');
          hasError = true;
        }

        if (hasError) return;

        if (id) {
          // Update
          VaultStorage.updatePassword(id, { website, username, password, category, notes, favorite });
          UI.showToast('Password updated successfully', 'success');
        } else {
          // Add
          VaultStorage.addPassword({ website, username, password, category, notes, favorite });
          UI.showToast(`Password for "${website}" added to ${category}${favorite ? ' & Favorites' : ''}`, 'success');
        }

        UI.closePasswordModal();
        loadData();
        updateUI();
      });
    }

    // 7. Table Event Delegation (Eye toggle, Copy, Edit, Delete, Favorite)
    const tbody = document.getElementById('passwordsTbody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        // Eye Toggle
        const eyeBtn = e.target.closest('.btn-toggle-eye');
        if (eyeBtn) {
          const id = eyeBtn.dataset.id;
          UI.togglePasswordVisibility(id, allPasswords);
          return;
        }

        // Copy Username
        const copyUserBtn = e.target.closest('.btn-copy-username');
        if (copyUserBtn) {
          const user = copyUserBtn.dataset.username;
          UI.copyToClipboard(user, 'Username copied to clipboard');
          return;
        }

        // Copy Password
        const copyPwdBtn = e.target.closest('.btn-copy-password');
        if (copyPwdBtn) {
          const pwd = copyPwdBtn.dataset.password;
          UI.copyToClipboard(pwd, 'Password copied to clipboard');
          return;
        }

        // Favorite Toggle
        const favBtn = e.target.closest('.btn-fav');
        if (favBtn) {
          const id = favBtn.dataset.id;
          const isFav = VaultStorage.toggleFavorite(id);
          loadData();
          updateUI();
          UI.showToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'info');
          return;
        }

        // Edit
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
          const id = editBtn.dataset.id;
          const item = allPasswords.find(p => p.id === id);
          if (item) {
            UI.openPasswordModal(true, item);
          }
          return;
        }

        // Delete (Trigger Confirmation Modal)
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
          const id = deleteBtn.dataset.id;
          const website = deleteBtn.dataset.website;
          openDeleteConfirmation(id, website);
          return;
        }
      });
    }

    // 8. Delete Confirmation Modal
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteTargetWebsite = document.getElementById('deleteTargetWebsite');

    function openDeleteConfirmation(id, website) {
      deleteTargetId = id;
      if (deleteTargetWebsite) deleteTargetWebsite.textContent = website;
      if (deleteModal) deleteModal.classList.add('open');
    }

    function closeDeleteConfirmation() {
      deleteTargetId = null;
      if (deleteModal) deleteModal.classList.remove('open');
    }

    if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteConfirmation);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteConfirmation);

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (deleteTargetId) {
          VaultStorage.deletePassword(deleteTargetId);
          UI.revealedRows.delete(deleteTargetId);
          closeDeleteConfirmation();
          loadData();
          updateUI();
          UI.showToast('Password deleted successfully', 'success');
        }
      });
    }

    // 9. Standalone Password Generator Modal
    const genModal = document.getElementById('generatorModal');
    const navOpenGenBtn = document.getElementById('navOpenGenerator');
    const cardGenBtn = document.getElementById('cardGenBtn');
    const closeGenModalBtn = document.getElementById('closeGenModalBtn');
    const genRefreshBtn = document.getElementById('genRefreshBtn');
    const genCopyBtn = document.getElementById('genCopyBtn');
    const genCopyCloseBtn = document.getElementById('genCopyCloseBtn');
    const genUseBtn = document.getElementById('genUseBtn');
    const genLengthSlider = document.getElementById('genLengthSlider');
    const genLengthVal = document.getElementById('genLengthVal');
    const genResultText = document.getElementById('genResultText');

    function openGeneratorModal() {
      generateStandalonePassword();
      if (genModal) genModal.classList.add('open');
    }

    function closeGeneratorModal() {
      if (genModal) genModal.classList.remove('open');
      const genFeedback = document.getElementById('genSecurityFeedback');
      if (genFeedback) genFeedback.style.display = 'none';
      const genCheckInp = document.getElementById('genCheckInput');
      if (genCheckInp) genCheckInp.value = '';
    }

    function generateStandalonePassword() {
      const length = parseInt(genLengthSlider ? genLengthSlider.value : 16, 10);
      const uppercase = document.getElementById('genOptUppercase')?.checked ?? true;
      const lowercase = document.getElementById('genOptLowercase')?.checked ?? true;
      const numbers = document.getElementById('genOptNumbers')?.checked ?? true;
      const symbols = document.getElementById('genOptSymbols')?.checked ?? true;

      const pwd = PasswordGenerator.generate({ length, uppercase, lowercase, numbers, symbols });
      if (genResultText) genResultText.textContent = pwd;
      return pwd;
    }

    if (navOpenGenBtn) navOpenGenBtn.addEventListener('click', openGeneratorModal);
    if (cardGenBtn) cardGenBtn.addEventListener('click', openGeneratorModal);
    if (closeGenModalBtn) closeGenModalBtn.addEventListener('click', closeGeneratorModal);
    if (genRefreshBtn) genRefreshBtn.addEventListener('click', generateStandalonePassword);

    if (genLengthSlider && genLengthVal) {
      genLengthSlider.addEventListener('input', (e) => {
        genLengthVal.textContent = e.target.value;
        generateStandalonePassword();
      });
    }

    ['genOptUppercase', 'genOptLowercase', 'genOptNumbers', 'genOptSymbols'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', generateStandalonePassword);
    });

    // Check Password in Generator Modal
    const genCheckBtn = document.getElementById('genCheckPasswordBtn');
    const genCheckInput = document.getElementById('genCheckInput');
    if (genCheckBtn) {
      genCheckBtn.addEventListener('click', () => {
        const pwdToCheck = (genCheckInput && genCheckInput.value.trim())
          ? genCheckInput.value
          : (genResultText ? genResultText.textContent.trim() : '');

        if (!pwdToCheck) {
          UI.showToast('Please enter or generate a password to check', 'warning');
          return;
        }

        const details = PasswordGenerator.checkPasswordDetails(pwdToCheck);
        const feedbackBox = document.getElementById('genSecurityFeedback');
        const strText = document.getElementById('genStrengthText');
        const strTip = document.getElementById('genStrengthTip');

        if (strText) {
          strText.textContent = details.strength;
          strText.className = `strength-status-text ${details.class}`;
        }
        if (strTip) {
          strTip.textContent = details.tip;
        }
        if (feedbackBox) {
          feedbackBox.style.display = 'block';
          UI.renderCriteriaFeedback('genCrit', details);
        }
        UI.showToast(`Password Strength: ${details.strength}`, details.strength === 'Strong' ? 'success' : details.strength === 'Medium' ? 'warning' : 'error');
      });
    }

    if (genCheckInput) {
      genCheckInput.addEventListener('input', (e) => {
        const feedbackBox = document.getElementById('genSecurityFeedback');
        if (feedbackBox && feedbackBox.style.display !== 'none') {
          const details = PasswordGenerator.checkPasswordDetails(e.target.value);
          const strText = document.getElementById('genStrengthText');
          const strTip = document.getElementById('genStrengthTip');
          if (strText) {
            strText.textContent = details.strength;
            strText.className = `strength-status-text ${details.class}`;
          }
          if (strTip) {
            strTip.textContent = details.tip;
          }
          UI.renderCriteriaFeedback('genCrit', details);
        }
      });
    }

    if (genCopyBtn) {
      genCopyBtn.addEventListener('click', () => {
        const pwd = genResultText ? genResultText.textContent : '';
        UI.copyToClipboard(pwd, 'Generated password copied to clipboard');
      });
    }

    if (genCopyCloseBtn) {
      genCopyCloseBtn.addEventListener('click', () => {
        const pwd = genResultText ? genResultText.textContent : '';
        UI.copyToClipboard(pwd, 'Generated password copied to clipboard');
        closeGeneratorModal();
      });
    }

    if (genUseBtn) {
      genUseBtn.addEventListener('click', () => {
        const pwd = genResultText ? genResultText.textContent : '';
        closeGeneratorModal();
        UI.openPasswordModal(false);
        const formPwd = document.getElementById('formPassword');
        if (formPwd) {
          formPwd.value = pwd;
          formPwd.type = 'text';
          UI.updateFormStrengthMeter(pwd);
        }
      });
    }

    // 10. Settings Modal & Vault Operations
    const settingsModal = document.getElementById('settingsModal');
    const navOpenSettings = document.getElementById('navOpenSettings');
    const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    const closeSettingsFooterBtn = document.getElementById('closeSettingsFooterBtn');
    const exportVaultBtn = document.getElementById('exportVaultBtn');
    const resetDemoFromSettingsBtn = document.getElementById('resetDemoFromSettingsBtn');
    const clearAllVaultBtn = document.getElementById('clearAllVaultBtn');
    const restoreDemoBtn = document.getElementById('restoreDemoBtn');

    function openSettings() {
      if (settingsModal) settingsModal.classList.add('open');
    }

    function closeSettings() {
      if (settingsModal) settingsModal.classList.remove('open');
    }

    if (navOpenSettings) navOpenSettings.addEventListener('click', openSettings);
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettings);
    if (closeSettingsFooterBtn) closeSettingsFooterBtn.addEventListener('click', closeSettings);

    // Export Vault JSON
    if (exportVaultBtn) {
      exportVaultBtn.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allPasswords, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `vaultguard_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        UI.showToast('Vault exported as JSON backup', 'success');
      });
    }

    // Reset Demo Data
    function handleRestoreDemo() {
      VaultStorage.restoreSampleData();
      loadData();
      updateUI();
      UI.showToast('Demo accounts restored successfully', 'success');
      closeSettings();
    }

    if (resetDemoFromSettingsBtn) resetDemoFromSettingsBtn.addEventListener('click', handleRestoreDemo);
    if (restoreDemoBtn) restoreDemoBtn.addEventListener('click', handleRestoreDemo);

    // Clear Vault
    if (clearAllVaultBtn) {
      clearAllVaultBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to completely erase all credentials from local storage?')) {
          VaultStorage.clearAll();
          loadData();
          updateUI();
          UI.showToast('All passwords cleared', 'warning');
          closeSettings();
        }
      });
    }

    // 11. Notifications Bell Dropdown
    const notifBellBtn = document.getElementById('notifBellBtn');
    const notifDropdown = document.getElementById('notifDropdown');

    if (notifBellBtn && notifDropdown) {
      notifBellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notifDropdown.classList.contains('open');
        notifDropdown.classList.toggle('open', !isOpen);
        notifBellBtn.setAttribute('aria-expanded', !isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !notifBellBtn.contains(e.target)) {
          notifDropdown.classList.remove('open');
          notifBellBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 12. Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    function openMobileSidebar() {
      if (sidebar) sidebar.classList.add('mobile-open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('mobile-open');
    }

    function closeMobileSidebar() {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('mobile-open');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    // 13. Escape Key Closes Any Open Modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        UI.closePasswordModal();
        closeDeleteConfirmation();
        closeGeneratorModal();
        closeSettings();
        closeMobileSidebar();
      }
    });
  }

  // Kickoff
  init();
});
