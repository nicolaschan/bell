export default function () {
  const greetings = ['Hello', 'Hi there', 'Greetings', 'Howdy']
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]
  const colors = ['red', 'orange', 'lime', 'darkblue', 'magenta']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const emojis = ['😸', '💻', '😀', '⏱', '🙃', '😁', '😎', '🙀', '🦄', '🤠']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  console.log(`%c${emoji} ${greeting}! Looking for the code?
    This is an open source project and we welcome contributions.
      %c👀 View the code: %chttps://github.com/nicolaschan/bell
      %c🐞 Report a bug: %chttps://github.com/nicolaschan/bell/issues`,
  `color:${color};font-weight:900;font-size:18px;font-family:sans-serif`,
  'color:black;font-size:18px;font-family:sans-serif',
  'color:blue;font-size:18px;font-family:sans-serif',
  'color:black;font-size:18px;font-family:sans-serif',
  'color:blue;font-size:18px;font-family:sans-serif')
}
