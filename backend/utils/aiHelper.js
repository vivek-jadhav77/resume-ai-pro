const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Execute an AI operation with automatic retries and exponential backoff.
 * @param {Function} operation - The async operation to execute.
 * @param {Number} maxRetries - Maximum number of retries (default: 3).
 * @param {Array} delays - Array of delay times in ms [attempt1, attempt2, attempt3].
 */
const withRetry = async (operation, maxRetries = 3, delays = [2000, 5000, 10000]) => {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      console.error(`AI Operation Failed (Attempt ${attempt + 1}):`, error.message);
      
      // Don't wait after the last attempt
      if (attempt === maxRetries) {
        console.error("AI Operation exhausted all retries.");
        throw error;
      }

      const delayMs = delays[attempt] || 2000;
      console.log(`Waiting ${delayMs}ms before retrying...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      attempt++;
    }
  }
};

/**
 * Common fallback handler that suppresses the error and returns a default value.
 * @param {Function} operation - The operation to attempt (wrapped in withRetry).
 * @param {Object} fallbackValue - The value to return if all retries fail.
 * @param {String} contextName - The name of the operation for logging.
 */
const withFallback = async (operation, fallbackValue, contextName = "AI Task") => {
  try {
    return await withRetry(operation);
  } catch (error) {
    console.error(`[FALLBACK ACTIVATED] ${contextName} failed completely. Using fallback.`);
    // We can also trigger specific alerts here if needed (e.g. Sentry)
    return fallbackValue;
  }
};

module.exports = {
  genAI,
  withRetry,
  withFallback
};
