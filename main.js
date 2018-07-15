const childProcess = require('child_process')
const readline = require('readline');
const Connection = require('./Connection');
const DEFAULT_ARGS = [
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    // TODO: Support OOOPIF. @see https://github.com/GoogleChrome/puppeteer/issues/2548
    '--disable-features=site-per-process',
    '--disable-hang-monitor',
    '--disable-popup-blocking',
    '--disable-prompt-on-repost',
    '--disable-sync',
    '--disable-translate',
    '--metrics-recording-only',
    '--no-first-run',
    '--safebrowsing-disable-auto-update',
];

let portNumber = 9222;
const chromeExecutable = "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome";
const chromeArguments = [];
chromeArguments.push(...DEFAULT_ARGS);
// headlessにするためのオプション
chromeArguments.push(
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--mute-audio'
);
chromeArguments.push(
  `--remote-debugging-port=${portNumber}`
);

// 1. chrome起動
const chromeProcess = childProcess.spawn(
  chromeExecutable,
  chromeArguments,
);
console.log(chromeProcess.pid);

// 2. websocketのセッション作成
const rl = readline.createInterface({ input: chromeProcess.stderr });
const wsEndpoint = new Promise((resolve, reject) => {
  rl.on('line', (line) => {
    console.log(line);
    const match = line.match(/^DevTools listening on (ws:\/\/.*)$/);
    if (!match)
      return;
    resolve(match[1]);
  });
  rl.on('close', ()=> { console.log('close'); });
  rl.on('exit', ()=> { console.log('exit'); });
  rl.on('error', ()=> { console.log('error'); });
}).then((url) => {
  // chrome dev tool protocol経由でmessage送信
  (async () => {
    let connection = await Connection.createForWebSocket(url, 0);
    connection.send('Browser.getVersion', {});
  })();
});
