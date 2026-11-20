#!/usr/bin/env python3
"""
Kanishka Tashkent — Preview the Astro production build
Usage: python3 server.py [port]
"""

import http.server
import sys
import webbrowser
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean logging output
        sys.stdout.write(f"[Kanishka Server] {self.address_string()} - {format % args}\n")

if __name__ == "__main__":
    if not os.path.isfile(os.path.join(DIRECTORY, "index.html")):
        sys.exit("Сначала соберите Astro-проект: cd ui && pnpm build")
    os.chdir(DIRECTORY)
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as httpd:
        url = f"http://127.0.0.1:{PORT}"
        print("=" * 60)
        print(f"  KANISHKA TASHKENT — Digital Showroom Server")
        print(f"  Сервер запущен: {url}")
        print(f"  Для остановки нажмите Ctrl + C")
        print("=" * 60)
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен.")
