import http.server
import socketserver
import json
import os

PORT = 8000

class GameServer(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                log_entry = json.loads(post_data.decode('utf-8'))
                level = log_entry.get('level', 'INFO').upper()
                msg = log_entry.get('message', '')
                scene = log_entry.get('scene', 'System')
                
                # ANSI colors for better visibility
                colors = {
                    'INFO': '\033[94m',   # Blue
                    'WARN': '\033[93m',   # Yellow
                    'ERROR': '\033[91m',  # Red
                    'SUCCESS': '\033[92m' # Green
                }
                reset = '\033[0m'
                color = colors.get(level, reset)
                
                print(f"{color}[CLIENT LOG] [{scene}] {level}: {msg}{reset}")
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "ok"}).encode())
            except Exception as e:
                print(f"Error handling log: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

# Change directory to project root if script is run from elsewhere
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), GameServer) as httpd:
    print(f"Valentine Game Server started at http://localhost:{PORT}")
    print("Capturing client logs below...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
        httpd.server_close()
