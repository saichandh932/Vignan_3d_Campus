const http = require('http');
const { exec } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

console.log("Launching Chrome in headless mode...");
const chromeProcess = exec(`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --window-size=1280,720 --remote-debugging-port=9222 --disable-gpu http://localhost:5173`);

setTimeout(() => {
  console.log("Fetching debug targets...");
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const targets = JSON.parse(data);
        const mainTarget = targets.find(t => t.url.includes('localhost'));
        if (!mainTarget) {
          console.log("Main target not found.");
          chromeProcess.kill();
          process.exit(1);
        }
        
        console.log("Connecting to WebSocket:", mainTarget.webSocketDebuggerUrl);
        const ws = new WebSocket(mainTarget.webSocketDebuggerUrl);
        
        let msgId = 1;
        ws.on('open', () => {
          ws.send(JSON.stringify({ id: msgId++, method: "Page.enable" }));
          
          setTimeout(() => {
            console.log("Capturing screenshot...");
            ws.send(JSON.stringify({
              id: 2,
              method: "Page.captureScreenshot",
              params: { format: "png" }
            }));
          }, 3000);
        });

        ws.on('message', (message) => {
          const response = JSON.parse(message);
          if (response.id === 2 && response.result && response.result.data) {
            const buffer = Buffer.from(response.result.data, 'base64');
            fs.writeFileSync('C:\\Users\\DELL\\.gemini\\antigravity\\scratch\\vignan-3d-campus\\debug_screenshot.png', buffer);
            console.log("Screenshot saved as debug_screenshot.png");
            ws.close();
            chromeProcess.kill();
            process.exit(0);
          }
        });

      } catch (err) {
        console.error("Error processing:", err);
        chromeProcess.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error("HTTP GET error:", err);
    chromeProcess.kill();
    process.exit(1);
  });
}, 3000);
