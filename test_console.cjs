const http = require('http');
const { exec } = require('child_process');
const WebSocket = require('ws');

console.log("Launching Chrome in headless mode...");
const chromeProcess = exec(`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --remote-debugging-port=9222 --disable-gpu http://localhost:5173`);

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
        
        console.log("Target found. Connecting to WebSocket:", mainTarget.webSocketDebuggerUrl);
        const ws = new WebSocket(mainTarget.webSocketDebuggerUrl);
        
        ws.on('open', () => {
          console.log("WS open. Enabling runtime...");
          // Enable Runtime domain to receive console API calls and exceptions
          ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
          
          // Evaluate the error display text content
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: "Runtime.evaluate",
              params: {
                expression: "document.getElementById('error-display').innerText || 'NO_ERROR_SHOWN'"
              }
            }));
          }, 1500);
        });

        ws.on('message', (message) => {
          const response = JSON.parse(message);
          
          // Print incoming console logs/exceptions
          if (response.method === 'Runtime.consoleAPICalled') {
            console.log("[Console Log]:", response.params.args.map(a => a.value).join(' '));
          } else if (response.method === 'Runtime.exceptionThrown') {
            console.error("[Exception]:", response.params.exceptionDetails.exception.description);
          } else if (response.id === 2) {
            console.log("[Error Display Value]:", response.result.result.value);
            ws.close();
            chromeProcess.kill();
            process.exit(0);
          }
        });

        ws.on('error', (err) => {
          console.error("WS error:", err);
          chromeProcess.kill();
          process.exit(1);
        });

      } catch (err) {
        console.error("Error processing:", err);
        chromeProcess.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error("Error connecting to remote debugging port:", err);
    chromeProcess.kill();
    process.exit(1);
  });
}, 3000);
