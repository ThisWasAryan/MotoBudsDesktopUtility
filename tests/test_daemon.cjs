const { spawn } = require('child_process');
const path = require('path');

// 1. Start mock server
const mockServer = spawn('python3', [path.join(__dirname, '../backend/mock_earbuds.py')]);
mockServer.stdout.on('data', d => console.log('Mock Server:', d.toString().trim()));

setTimeout(() => {
    // 2. Start daemon
    const daemon = spawn('python3', [path.join(__dirname, '../backend/moto_control.py'), '--daemon', '--mac', '127.0.0.1', '--port', '5001']);
    
    daemon.stdout.on('data', d => {
        const lines = d.toString().split('\n').filter(l => l.trim().length > 0);
        for (const line of lines) {
            console.log('Daemon Output:', line);
            try {
                const j = JSON.parse(line);
                if (j.type === 'status' && j.status === 'connected') {
                    // Send ANC command
                    console.log('Sending ANC command to daemon...');
                    daemon.stdin.write(JSON.stringify({ op: 'anc', mode: 1 }) + '\n');
                } else if (j.type === 'event') {
                    console.log('SUCCESS! Received hardware event:', j.data);
                    cleanup();
                }
            } catch(e){}
        }
    });

    daemon.stderr.on('data', d => console.log('Daemon Error:', d.toString().trim()));

}, 1000);

function cleanup() {
    mockServer.kill();
    process.exit(0);
}
