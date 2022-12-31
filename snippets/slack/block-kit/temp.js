function sample() {
  const webhookURL = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  const slack = useSlackBlockKit(webhookURL);

  slack.section
    .mrkdwn('*markdown*')
    .divider()
    .section.mrkdwn(':white_check_mark: with emoji')
    .section.mrkdwn('- hss \n- hee')
    .divider()
    .section.mrkdwn(':calendar: next action')
    .sendToSlack({
      username: 'display-name',
      icon_url: 'https://example.com'
    });
}

/**
 * @typedef {{
 *  channel?: string;
 *  username?: string;
 *  icon_url?: string;
 *  icon_emoji?: string;
 * }} IncomingWebhookOptions
 *
 * @param {string} webhookURL
 */
const useSlackBlockKit = (webhookURL) => {
  const state = {
    blocks: []
  };

  const addBlock = (block) => {
    state.blocks.push(block);
    return instance;
  };

  /**
   * @param {string} text
   * @param {boolean} emoji
   */
  const _plainText = (text, emoji) => ({
    type: 'plain_text',
    text,
    emoji
  });

  const sectionBuilder = () => {
    const block = (element) => addBlock({ type: 'section', ...element });

    const mrkdwn = (text) => ({ text: { type: 'mrkdwn', text } });
    const plainText = (text, emoji) => ({ text: _plainText(text, emoji) });

    const linkButton = ({ message, buttonText, value, url, actionId }, emoji) => ({
      ...mrkdwn(message, emoji),
      accessory: {
        type: 'button',
        ...plainText(buttonText, emoji),
        value,
        url,
        action_id: actionId
      }
    });

    /**
     * @param {string[]} texts
     * @param {boolean} emoji
     */
    const textFields = (texts, emoji = true) => ({
      fields: texts.map((v) => _plainText(v, emoji))
    });

    return {
      mrkdwn: (text) => block(mrkdwn(text)),
      plainText: (text, emoji = true) => block(plainText(text, emoji)),
      textFields: (texts, emoji = true) => block(textFields(texts, emoji)),
      linkButton: (params, emoji = true) => block(linkButton(params, emoji))
    };
  };

  const actions = {};
  const divider = () => {
    addBlock({ type: 'divider' });
    return self;
  };
  const image = {};
  const context = {};
  const input = {};

  const headerBuilder = () => {
    const block = (element) => addBlock({ type: 'header', ...element });

    return {
      plainText: (text, emoji = true) => block({ text: _plainText(text, emoji) })
    };
  };

  const copyPayload = () => {
    if (state.blocks.length < 1) throw new Error('最低1ブロック必要です。');
    return { blocks: [...state.blocks] };
  };

  const clear = () => {
    state.blocks = [];
  };

  /**
   * @param {IncomingWebhookOptions | undefined} [options]
   */
  const sendToSlack = (options) => {
    UrlFetchApp.fetch(webhookURL, {
      method: 'POST',
      payload: JSON.stringify({
        ...copyPayload(),
        ...options
      })
    });
  };

  const instance = {
    section: sectionBuilder(),
    header: headerBuilder(),
    divider,
    clear,
    copyPayload,
    sendToSlack
  };

  return instance;
};
