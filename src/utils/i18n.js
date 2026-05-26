import en from "../locales/en.json";
import ru from "../locales/ru.json";

const locales = { en, ru };

/**
 * Translates a dot-notation key path (e.g., "signin.otp.title") into the target language.
 * Automatically falls back to English if a key is not found, and supports template variable interpolation.
 *
 * @param {string} keyPath - Dotted path to the translation key.
 * @param {string} lang - Language code ('en' or 'ru').
 * @param {Object} params - Key-value map for string interpolation.
 * @returns {string} The translated string.
 */
export const t = (keyPath, lang = "en", params = {}) => {
  const file = locales[lang] || locales["en"];
  if (!file) return keyPath;

  const parts = keyPath.split(".");
  let current = file;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current !== "string") {
    // If Russian key is missing, attempt fallback to English
    if (lang !== "en") {
      return t(keyPath, "en", params);
    }
    return keyPath;
  }

  let result = current;
  Object.keys(params).forEach((key) => {
    const value = params[key];
    // Replaces both {{key}} and {key} variables
    result = result
      .replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value)
      .replace(new RegExp(`{\\s*${key}\\s*}`, "g"), value);
  });

  return result;
};
