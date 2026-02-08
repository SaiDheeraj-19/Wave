
// Heartbeat Worker for iOS Background Persistence
// This keeps the event loop active even when the browser throttles the main thread.
let timer = null;

self.onmessage = function (e) {
    if (e.data === 'start') {
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            self.postMessage('tick');
        }, 250);
    } else if (e.data === 'stop') {
        if (timer) clearInterval(timer);
        timer = null;
    }
};
