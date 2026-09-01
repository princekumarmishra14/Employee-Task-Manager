/**
 * Reusable enterprise password validation utility.
 * Enforces strict security policy rules on character occurrences and lengths.
 */

export interface PasswordValidation {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
  isValid: boolean;
}

/**
 * Validates a password string against enterprise password rules:
 * - Minimum 8 characters in length
 * - Contains at least one uppercase letter (A-Z)
 * - Contains at least one lowercase letter (a-z)
 * - Contains at least one number (0-9)
 * - Contains at least one special character
 * - Contains no spaces (no whitespace, tabs, or newlines)
 */
export function validatePassword(password: string): PasswordValidation {
  const minLength = password.length >= 8;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const special = /[!@#$%^&*()_\-+=\[\]{}|:;"'<>,.?/~`\\]/.test(password);
  const noSpaces = !/\s/.test(password); // Rejects spaces, tabs, and newlines

  const isValid = minLength && uppercase && lowercase && number && special && noSpaces;

  return {
    minLength,
    uppercase,
    lowercase,
    number,
    special,
    noSpaces,
    isValid,
  };
}
