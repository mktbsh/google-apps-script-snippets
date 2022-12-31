/**
 *
 * @param {Function} addBlockAction
 */
export const sectionBuilder = (addBlockAction) => {
  const block = (element) => addBlockAction({ type: 'section', ...element });

  const markdown = (text) => ({ text: { type: 'mrkdwn', text } });
  const plainText = (text, emoji) => ({ text: { type: 'plain_text', text, emoji } });
  const textFields = (texts, emoji) => ({ fields: texts.map((v) => plainText(v, emoji)) });
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
     */
    mrkdwn: (text) => block(markdown(text)),
    /**
     * @param {string} text
     * @param {boolean} emoji
     */
    plainText: (text, emoji = true) => block(plainText(text, emoji)),
    /**
     * @param {string[]} texts
     * @param {boolean} emoji
     */
    textFields: (texts, emoji = true) => block(textFields(texts, emoji)),
    /**
     * @param {{
     *  actionId: string;
     *  buttonLabel: string;
     *  emoji: boolean;
     *  message: string;
     *  value: string;
     *  url: string;
     * }} props
     */
    linkButton: (props) => block(linkButton(props))
  };
};
