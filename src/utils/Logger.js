class Logger {
    static async log(message, level = 'INFO', scene = 'General') {
        // Also print to browser console
        console.log(`[${scene}] ${level}: ${message}`);

        try {
            await fetch('/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level,
                    message,
                    scene
                }),
            });
        } catch (e) {
            // Silently fail if server isn't supporting logs
        }
    }

    static info(msg, scene) { this.log(msg, 'INFO', scene); }
    static warn(msg, scene) { this.log(msg, 'WARN', scene); }
    static error(msg, scene) { this.log(msg, 'ERROR', scene); }
    static success(msg, scene) { this.log(msg, 'SUCCESS', scene); }
}

export default Logger;
