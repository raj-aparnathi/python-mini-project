/**
 * VaultGuard - Password Generator & Strength Calculator
 * Cryptographically secure generator using window.crypto.getRandomValues()
 */

class PasswordGenerator {
  static CHARSETS = {
    uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // Excluded easily confused I, O
    lowercase: 'abcdefghijkmnopqrstuvwxyz', // Excluded easily confused l
    numbers: '23456789',                   // Excluded easily confused 0, 1
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,.-='
  };

  /**
   * Generates a strong password based on options
   * @param {Object} options
   * @param {number} options.length
   * @param {boolean} options.uppercase
   * @param {boolean} options.lowercase
   * @param {boolean} options.numbers
   * @param {boolean} options.symbols
   * @returns {string}
   */
  static generate({
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = {}) {
    let pool = '';
    const guaranteedChars = [];

    if (uppercase) {
      pool += this.CHARSETS.uppercase;
      guaranteedChars.push(this.getRandomChar(this.CHARSETS.uppercase));
    }
    if (lowercase) {
      pool += this.CHARSETS.lowercase;
      guaranteedChars.push(this.getRandomChar(this.CHARSETS.lowercase));
    }
    if (numbers) {
      pool += this.CHARSETS.numbers;
      guaranteedChars.push(this.getRandomChar(this.CHARSETS.numbers));
    }
    if (symbols) {
      pool += this.CHARSETS.symbols;
      guaranteedChars.push(this.getRandomChar(this.CHARSETS.symbols));
    }

    // Fallback if user unchecks all
    if (!pool) {
      pool = this.CHARSETS.lowercase + this.CHARSETS.numbers;
      guaranteedChars.push(this.getRandomChar(pool));
    }

    const remainingLength = Math.max(0, length - guaranteedChars.length);
    const resultChars = [...guaranteedChars];

    for (let i = 0; i < remainingLength; i++) {
      resultChars.push(this.getRandomChar(pool));
    }

    // Cryptographic Fisher-Yates shuffle
    for (let i = resultChars.length - 1; i > 0; i--) {
      const randArr = new Uint32Array(1);
      window.crypto.getRandomValues(randArr);
      const j = randArr[0] % (i + 1);
      [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
    }

    return resultChars.join('');
  }

  static getRandomChar(str) {
    const randArr = new Uint32Array(1);
    window.crypto.getRandomValues(randArr);
    return str[randArr[0] % str.length];
  }

  /**
   * Analyzes password strength and returns rating
   * @param {string} password
   * @returns {{score: number, label: 'Weak' | 'Medium' | 'Strong', class: string, tip: string}}
   */
  static evaluateStrength(password) {
    if (!password || password.length === 0) {
      return { score: 0, label: 'None', class: '', tip: 'Enter a password' };
    }

    let score = 0;
    const len = password.length;

    // Length evaluation
    if (len >= 8) score += 25;
    if (len >= 12) score += 25;
    if (len >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*()_+~`|}{[\]:;?><,.\-=]/.test(password)) score += 15;

    // Common weakness penalties
    if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
      score = Math.min(score, 40);
    }

    if (score >= 70 && len >= 10) {
      return { score, label: 'Strong', class: 'strong', tip: 'Resistant to brute force attacks' };
    } else if (score >= 40 && len >= 6) {
      return { score, label: 'Medium', class: 'medium', tip: 'Moderate strength, add special symbols' };
    } else {
      return { score, label: 'Weak', class: 'weak', tip: 'Easily guessed, use 12+ mixed characters' };
    }
  }

  /**
   * Performs comprehensive security analysis with criteria breakdown
   * @param {string} password
   * @returns {{strength: 'Weak' | 'Medium' | 'Strong', score: number, class: string, tip: string, checks: {length: boolean, uppercase: boolean, lowercase: boolean, number: boolean, special: boolean}}}
   */
  static checkPasswordDetails(password) {
    const pwd = password || '';
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+~`|}{[\]:;?><,.\-=]/.test(pwd);
    const strength = this.evaluateStrength(pwd);

    return {
      strength: strength.label === 'None' ? 'Weak' : strength.label,
      score: strength.score,
      class: strength.class || 'weak',
      tip: strength.tip,
      checks: {
        length: hasLength,
        uppercase: hasUpper,
        lowercase: hasLower,
        number: hasNumber,
        special: hasSpecial
      }
    };
  }
}
