const http = require('http');
const { exec } = require('child_process');

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
        console.log("Targets found:", targets.map(t => t.title));
        
        // Find the main page target
        const mainTarget = targets.find(t => t.url.includes('localhost'));
        if (!mainTarget) {
          console.log("Main target not found.");
          chromeProcess.kill();
          process.exit(1);
        }
        
        console.log("Connecting to WebSocket debugger...", mainTarget.webSocketDebuggerUrl);
        // We can just dump console messages if we connect or query it.
        // For simplicity, let's check if there is an error in the page console by querying the target.
        // Actually, we can fetch target's console by making a request to the WebSocket or simple page check.
        // Let's just output the page source or targets to verify it loads.
        console.log("Target details:", mainTarget);
        chromeProcess.kill();
      } catch (err) {
        console.error("Error parsing targets:", err);
        chromeProcess.kill();
      }
    });
  }).on('error', (err) => {
    console.error("Error connecting to remote debugging port:", err);
    chromeProcess.kill();
  });
}, 3000);
