import log from 'loglevel';

// set log level depending on environment
if (process.env.NODE_ENV === 'production') {
  log.setLevel('warn');  // only warnings and errors show in production
} else {
  log.setLevel('debug'); // show all logs in development (debgug, info, warn, error)
}

export default log;