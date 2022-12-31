function test() {
  const slack = useSlackBlockKit();

  slack.Header.plainText('This is header block')
    .Section.mrkdwn('*Bold text*')
    .Section.mrkdwn('````code block```')
    .Divider.plain()
    .sendToSlack('SLACK_INCOMING_WEBHOOK_URL', {
      channel: '#random',
      username: 'google-apps-script-bot'
    });
}

const useSlackBlockKit = () => {
  const state = Symbol('state');

  class BlockKit {
    constructor() {
      this.clear();
    }

    clear() {
      this[state] = {
        blocks: []
      };
    }

    /**
     * @returns {{
     *  blocks: any[]
     * }}
     */
    copyPayload() {
      const blocks = this[state].blocks;
      if (blocks.length < 1) throw new Error('At least one block is required.');
      return {
        blocks: JSON.parse(JSON.stringify(blocks))
      };
    }

    /**
     *
     * @param {string} webhookURL
     * @param {{
     *  channel?: string;
     *  username?: string;
     *  icon_url?: string;
     *  icon_emoji?: string;
     * }} options
     */
    sendToSlack(webhookURL, options) {
      const response = UrlFetchApp.fetch(webhookURL, {
        method: 'post',
        payload: JSON.stringify({
          ...options,
          ...this.copyPayload()
        })
      });

      if (response.getResponseCode() !== 200) {
        throw new Error('A status code other than 200 was returned.');
      }

      this.clear();
    }

    get Divider() {
      const divider = (props) => {
        this[state].blocks.push({ type: 'divider', ...props });
        return this;
      };

      return {
        plain: () => divider()
      };
    }

    get Header() {
      const header = (props) => {
        this[state].blocks.push({ type: 'header', ...props });
        return this;
      };

      return {
        /**
         *
         * @param {string} text
         * @param {boolean} emoji
         * @returns {BlockKit}
         */
        plainText: (text, emoji = true) => header({ text: { type: 'plain_text', text, emoji } })
      };
    }

    get Section() {
      const section = (props) => {
        this[state].blocks.push({ type: 'section', ...props });
        return this;
      };

      const markdown = (text) => ({ text: { type: 'mrkdwn', text } });
      const plainText = (text, emoji) => ({ text: { type: 'plain_text', text, emoji } });
      const textFields = (texts, emoji) => ({
        fields: texts.map((v) => plainText(v, emoji))
      });
      const linkButton = (props) => ({
        ...markdown(props.message, props.emoji),
        accessory: {
          type: 'button',
          ...plainText(props.buttonLabel, props.emoji),
          value: props.value,
          url: props.url,
          action_id: props.actionId
        }
      });

      return {
        /**
         * @param {string} text
         * @returns {BlockKit}
         */
        mrkdwn: (text) => section(markdown(text)),
        /**
         * @param {string} text
         * @param {boolean} emoji
         * @returns {BlockKit}
         */
        plainText: (text, emoji = true) => section(plainText(text, emoji)),
        /**
         * @param {string[]} texts
         * @param {boolean} emoji
         * @returns {BlockKit}
         */
        textFields: (texts, emoji = true) => section(textFields(texts, emoji)),
        /**
         * @param {{
         *  actionId: string;
         *  buttonLabel: string;
         *  emoji: boolean;
         *  message: string;
         *  value: string;
         *  url: string;
         * }} props
         * @returns {BlockKit}
         */
        linkButton: (props) => section(linkButton(props))
      };
    }

    get Actions() {
      throw new Error('"Actions" is not yet implemented.');
    }

    get Image() {
      throw new Error('"Image" block is not yet implemented.');
    }

    get Context() {
      throw new Error('"Context" block is not yet implemented.');
    }

    get Input() {
      throw new Error('"Input" block is not yet implemented.');
    }
  }

  return new BlockKit();
};
