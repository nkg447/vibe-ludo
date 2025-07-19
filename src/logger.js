const DEBUG = process.env.NODE_ENV === 'development';

const logger = {
  log: (...args) => {
    if (DEBUG) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (DEBUG) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (DEBUG) {
      console.warn(...args);
    }
  },
};

export default logger;
