/* globals IMAGINARY */
import GradientDescentGame from './game';

const defaultConfig = {
  defaultLanguage: 'en',
};

/**
 * Loads the config file from an external JSON file
 *
 * @param {string} uri
 * @return {Promise<any>}
 */
async function loadConfig(uri) {
  const response = await fetch(uri);
  if (response.status >= 200 && response.status < 300) {
    try {
      return await response.json();
    } catch (e) {
      throw new Error(`Error parsing config file: ${e.message}`);
    }
  }
  throw new Error(`Server returned status ${response.status} (${response.statusText}) loading config file.`);
}

/**
 * Load config files and start the program
 */
(async function main() {
  try {
    const config = Object.assign({}, defaultConfig, await loadConfig('./config.json'));
    await IMAGINARY.i18n.init({
      queryStringVariable: 'lang',
      translationsDirectory: 'tr',
      defaultLanguage: config.defaultLanguage || 'en',
    });
    // eslint-disable-next-line no-unused-vars
    const game = new GradientDescentGame(
      document.querySelector('.main'),
      config
    );
    await game.init();
    game.run();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}());
