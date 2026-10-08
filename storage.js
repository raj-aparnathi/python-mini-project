/**
 * VaultGuard - LocalStorage Vault Manager
 * Handles data persistence, CRUD operations, activity logs, and sample seeding.
 */

const VAULT_STORAGE_KEY = 'vaultguard_passwords';
const VAULT_LOGS_KEY = 'vaultguard_activity_logs';

// Default Demo Credentials (Safe fake data for preview)
const SAMPLE_VAULT_DATA = [
  {
    id: 'demo-1',
    website: 'Google Workspace',
    username: 'alex.dev@gmail.com',
    password: 'G00gle!Sec#2026',
    category: 'Work',
    notes: 'Primary 2FA authenticated workspace account. Connected to GCP console.',
    favorite: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'demo-2',
    website: 'GitHub',
    username: 'octo_alexander',
    password: 'Git_Hub$Auth99#dev',
    category: 'Work',
    notes: 'SSH key registered on workstation. Personal access token expires Q4.',
    favorite: true,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'demo-3',
    website: 'Chase Bank',
    username: 'chase_alex2026',
    password: 'Ch4s3#Fin@nc3!77',
    category: 'Banking',
    notes: 'Online banking & debit account. Security questions updated.',
    favorite: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'demo-4',
    website: 'Instagram',
    username: '@alex_visuals',
    password: 'instapassword123',
    category: 'Social',
    notes: 'Legacy password - flagged as weak due to low entropy.',
    favorite: false,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'demo-5',
    website: 'Amazon Prime',
    username: 'alex.orders@outlook.com',
    password: 'Amzn!Shop#2026Secure',
    category: 'Shopping',
    notes: 'Shared family subscription with one-click ordering enabled.',
    favorite: false,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'demo-6',
    website: 'ProtonMail',
    username: 'alex.vault@proton.me',
    password: 'Prtn!Encr#99xLpQ2',
    category: 'Email',
    notes: 'Secure backup email for recovery codes and keys.',
    favorite: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

class VaultStorage {
  /**
   * Retrieves all passwords from localStorage. Seeds sample demo data if empty.
   */
  static getPasswords() {
    try {
      const data = localStorage.getItem(VAULT_STORAGE_KEY);
      if (!data) {
        this.savePasswords(SAMPLE_VAULT_DATA);
        this.addActivityLog('Demo vault initialized with sample credentials');
        return [...SAMPLE_VAULT_DATA];
      }
      return JSON.parse(data) || [];
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      return [];
    }
  }

  /**
   * Saves passwords array to localStorage.
   */
  static savePasswords(passwords) {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(passwords));
      return true;
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
      return false;
    }
  }

  /**
   * Adds a new password item.
   */
  static addPassword(item) {
    const passwords = this.getPasswords();
    const now = new Date().toISOString();
    const newEntry = {
      id: 'vault_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      website: item.website.trim(),
      username: item.username.trim(),
      password: item.password,
      category: item.category || 'Other',
      notes: (item.notes || '').trim(),
      favorite: Boolean(item.favorite),
      createdAt: now,
      updatedAt: now
    };

    passwords.unshift(newEntry);
    this.savePasswords(passwords);
    this.addActivityLog(`Added password for "${newEntry.website}"`);
    return newEntry;
  }

  /**
   * Updates an existing password item.
   */
  static updatePassword(id, updatedFields) {
    const passwords = this.getPasswords();
    const index = passwords.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existing = passwords[index];
    const updated = {
      ...existing,
      ...updatedFields,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation timestamp
      updatedAt: new Date().toISOString()
    };

    passwords[index] = updated;
    this.savePasswords(passwords);
    this.addActivityLog(`Updated password for "${updated.website}"`);
    return updated;
  }

  /**
   * Deletes a password by ID.
   */
  static deletePassword(id) {
    const passwords = this.getPasswords();
    const item = passwords.find(p => p.id === id);
    const filtered = passwords.filter(p => p.id !== id);
    this.savePasswords(filtered);
    if (item) {
      this.addActivityLog(`Deleted password for "${item.website}"`);
    }
    return true;
  }

  /**
   * Toggles the favorite status for an entry.
   */
  static toggleFavorite(id) {
    const passwords = this.getPasswords();
    const item = passwords.find(p => p.id === id);
    if (!item) return false;

    item.favorite = !item.favorite;
    item.updatedAt = new Date().toISOString();
    this.savePasswords(passwords);
    this.addActivityLog(
      item.favorite
        ? `Marked "${item.website}" as favorite`
        : `Removed "${item.website}" from favorites`
    );
    return item.favorite;
  }

  /**
   * Clears the vault completely.
   */
  static clearAll() {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    this.addActivityLog('Vault data was cleared');
  }

  /**
   * Restores initial sample data.
   */
  static restoreSampleData() {
    this.savePasswords(SAMPLE_VAULT_DATA);
    this.addActivityLog('Restored demo credentials');
    return [...SAMPLE_VAULT_DATA];
  }

  /**
   * Returns recent activity logs.
   */
  static getActivityLogs() {
    try {
      const logs = localStorage.getItem(VAULT_LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  /**
   * Appends an activity log.
   */
  static addActivityLog(text) {
    try {
      const logs = this.getActivityLogs();
      logs.unshift({
        id: 'log_' + Date.now(),
        text,
        timestamp: new Date().toISOString()
      });
      // Keep last 15 logs
      if (logs.length > 15) logs.length = 15;
      localStorage.setItem(VAULT_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Could not save log:', e);
    }
  }
}
