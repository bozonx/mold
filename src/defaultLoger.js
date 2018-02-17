module.exports = {
  fatal: (message) => {
    throw new Error(`FATAL: ${message}`);
  },

  error(message) {
    console.error(`ERROR: ${message}`);
  },

  warn(message) {
    console.warn(message);
  },

  info(message) {
    console.info(message);
  },

  debug(message) {
    console.info(message);
  },

  verbose(message) {
    console.log(message);
  },

};
