import http.server
import socketserver
import urllib.request
import urllib.parse
import re
import json
import os
import time

PORT = int(os.environ.get("PORT", 8080))

class ProxyAndFileHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local cross-origin queries if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        url_parsed = urllib.parse.urlparse(self.path)
        path = url_parsed.path
        query_params = urllib.parse.parse_qs(url_parsed.query)

        # Intercept API calls
        if path == '/api/search':
            self.handle_api_search(query_params)
        elif path == '/api/players':
            self.handle_api_players(query_params)
        else:
            # Fallback to standard static file serving
            super().do_GET()

    def decode_response(self, body_bytes):
        res = []
        pos = 0
        while pos < len(body_bytes):
            try:
                chunk = body_bytes[pos:].decode('utf-8')
                res.append(chunk)
                break
            except UnicodeDecodeError as e:
                res.append(body_bytes[pos:pos+e.start].decode('utf-8'))
                invalid_byte = body_bytes[pos+e.start:pos+e.start+1]
                res.append(invalid_byte.decode('windows-1252', errors='replace'))
                pos = pos + e.start + 1
        return "".join(res)

    def get_request_headers(self, is_post=False):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8' if is_post else 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://french-stream.one/',
            'Origin': 'https://french-stream.one',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
        if is_post:
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
        return headers

    def handle_api_search(self, params):
        q = params.get('q', [''])[0]
        if not q:
            self.send_json([])
            return

        url = 'https://french-stream.one/engine/ajax/search.php'
        headers = self.get_request_headers(is_post=True)
        data = urllib.parse.urlencode({'query': q}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers)

        try:
            with urllib.request.urlopen(req, timeout=6) as response:
                html = self.decode_response(response.read())
                items = self.parse_search_html(html)
                self.send_json(items)
        except Exception as e:
            self.send_error_json(str(e))

    def fetch_series_episodes(self, news_id):
        v = int(time.time() // 30)
        candidates = [
            f'https://french-stream.one/static/series/{news_id}.js?v={v}',
            f'https://french-stream.one/data/eps_{news_id}.txt?v={v}',
            f'https://french-stream.one/ep-data.php?id={news_id}&format=js&v={v}'
        ]
        headers = self.get_request_headers(is_post=False)
        for url in candidates:
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    body_bytes = response.read()
                    body_str = self.decode_response(body_bytes)
                    body_str_clean = body_str.strip()
                    episodes_data = json.loads(body_str_clean)
                    return episodes_data
            except Exception as e:
                continue
        return None

    def handle_api_players(self, params):
        news_id = params.get('id', [''])[0]
        if not news_id:
            self.send_error_json('Missing id parameter')
            return

        url = f'https://french-stream.one/engine/ajax/film_api.php?id={news_id}'
        headers = self.get_request_headers(is_post=False)
        req = urllib.request.Request(url, headers=headers)

        try:
            with urllib.request.urlopen(req, timeout=6) as response:
                body_str = self.decode_response(response.read())
                data = json.loads(body_str)
                
                # If there are no active players, this is likely a series
                if not data.get("players"):
                    episodes = self.fetch_series_episodes(news_id)
                    if episodes:
                        data["is_series"] = True
                        data["episodes"] = episodes
                
                self.send_json(data)
        except Exception as e:
            self.send_error_json(str(e))

    def parse_search_html(self, html):
        items = []
        # Pattern to match each search-item block in DLE autocomplete
        pattern = re.compile(r"<div class='search-item'.*?</div></div></div>", re.DOTALL)
        blocks = pattern.findall(html)
        
        for block in blocks:
            href_match = re.search(r"onclick=\"location\.href='([^']+)'\"", block)
            href = href_match.group(1) if href_match else ""
            
            newsid_match = re.search(r"(?:newsid=)?(?:/)?(\d+)", href)
            newsid = newsid_match.group(1) if newsid_match else ""
            
            title_match = re.search(r"<div class='search-title'>(.*?)</div>", block)
            title = title_match.group(1) if title_match else ""
            title = title.replace("\\'", "'").replace('\\"', '"')
            
            poster_match = re.search(r"<img src='([^']+)'", block)
            poster = poster_match.group(1) if poster_match else ""
            
            if newsid:
                items.append({
                    'id': newsid,
                    'href': href,
                    'title': title,
                    'poster': poster
                })
        return items

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_error_json(self, message):
        self.send_response(500)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps({'error': True, 'message': message}, ensure_ascii=False).encode('utf-8'))

# Set directory to workspace root
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Ensure MIME type mappings are correct, resolving Windows registry bugs
ProxyAndFileHandler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
})

print(f"Cinémathèque - Démarrage du serveur sur http://localhost:{PORT}")
print("Pour quitter, appuyez sur Ctrl+C")

socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", PORT), ProxyAndFileHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur.")
