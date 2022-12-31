import { sectionBuilder } from './section-blocks';

/**
 *
 * @param {string} webhookURL
 */
const useSlackBlockKit = (webhookURL) => {
  let blocks = [];

  const addBlock = (block) => {
    blocks.push(block);
    return state;
  };

  /**
   * @returns {{
   *    blocks: any[]
   * }}
   */
  const copyPayload = () => {
    if (blocks.length < 1) throw new Error('At least one block is required.');
    return {
      blocks: JSON.parse(JSON.stringify(blocks))
    };
  };

  /**
   *
   * @param {{
   *   channel?: string;
   *  username?: string;
   *  icon_url?: string;
   *  icon_emoji?: string;
   * }} options
   * @returns {void}
   */
  const sendToSlack = (options) => {
    const res = UrlFetchApp.fetch(webhookURL, {
      method: 'post',
      payload: JSON.stringify({
        ...options,
        ...copyPayload()
      })
    });
    res.getResponseCode() === 200 && (blocks = []);
  };

  const state = {
    /**
     * Build block methods
     */
    section: sectionBuilder(addBlock),
    /**
     * Instance methods
     */
    clear: () => (blocks = []),
    copyPayload,
    sendToSlack
  };

  return state;
};

export { useSlackBlockKit };
