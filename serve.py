#!/usr/bin/env python3
"""LAN server with shared state API — phone & desktop sync via server file."""
import http.server
import json
import socket
import socketserver
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

PORT = 8888
DIR = Path(__file__).parent
DATA_DIR = DIR / "data"
STATE_FILE = DATA_DIR / "state.json"
PRIMARY_IP = None

DEFAULT_STATE = {
    "reminderTime": "09:30",
    "mulliganCredits": 0,
    "habits": [],
    "focusSessions": [],
}


def lan_ips():
    ips = []
    try:
        out = subprocess.check_output(["ifconfig"], text=True, stderr=subprocess.DEVNULL)
        current = None
        for line in out.splitlines():
            stripped = line.strip()
            if line and not line.startswith(("\t", " ")) and ":" in line and "inet" not in line:
                current = line.split(":")[0]
            elif stripped.startswith("inet ") and "127.0.0.1" not in stripped:
                parts = stripped.split()
                ip = parts[1]
                if ip.startswith(("192.168.", "10.", "172.")):
                    ips.append((current or "?", ip))
    except (subprocess.SubprocessError, OSError):
        pass

    if not ips:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                ips.append(("default", s.getsockname()[0]))
        except OSError:
            pass

    seen = set()
    unique = []
    for iface, ip in ips:
        if ip not in seen:
            seen.add(ip)
            unique.append((iface, ip))

    def sort_key(item):
        iface, ip = item
        if iface == "en0":
            return (0, ip)
        if ip.startswith("192.168."):
            return (1, ip)
        return (2, ip)

    unique.sort(key=sort_key)
    return unique


def write_lan_config(ip):
    config = {
        "canonicalHost": ip,
        "port": PORT,
        "canonicalUrl": f"http://{ip}:{PORT}/index.html",
    }
    (DATA_DIR / "lan-config.json").write_text(json.dumps(config, indent=2), encoding="utf-8")
    return config


def read_shared_state():
    if not STATE_FILE.exists():
        return {"revision": 0, "updatedAt": None, "state": None}
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"revision": 0, "updatedAt": None, "state": None}


def write_shared_state(state):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    current = read_shared_state()
    revision = int(current.get("revision") or 0) + 1
    payload = {
        "revision": revision,
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "state": state,
    }
    tmp = STATE_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(STATE_FILE)
    return payload


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIR), **kwargs)

    def do_GET(self):
        host = (self.headers.get("Host") or "").split(":")[0].lower()
        if PRIMARY_IP and host in ("127.0.0.1", "localhost"):
            target = f"http://{PRIMARY_IP}:{PORT}{self.path}"
            self.send_response(302)
            self.send_header("Location", target)
            self.end_headers()
            return

        path = self.path.split("?", 1)[0]
        if path == "/api/state":
            self._json_response(200, read_shared_state())
            return
        super().do_GET()

    def do_PUT(self):
        path = self.path.split("?", 1)[0]
        if path != "/api/state":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length) or b"{}")
            state = body.get("state")
            if not isinstance(state, dict) or "habits" not in state:
                self._json_response(400, {"error": "invalid state"})
                return
            saved = write_shared_state(state)
            self._json_response(200, saved)
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            self._json_response(400, {"error": str(e)})

    def _json_response(self, code, data):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def end_headers(self):
        path = self.path.split("?", 1)[0]
        if path.endswith((".html", ".js", ".css", ".json")) or path in ("/", ""):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
        if path == "/api/state":
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"[{self.client_address[0]}] {fmt % args}")


class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def free_port(port):
    try:
        out = subprocess.check_output(["lsof", "-ti", f":{port}"], text=True, stderr=subprocess.DEVNULL)
        my_pid = str(subprocess.os.getpid())
        for pid in out.strip().splitlines():
            if pid and pid != my_pid:
                try:
                    subprocess.os.kill(int(pid), 15)
                except OSError:
                    pass
    except subprocess.CalledProcessError:
        pass


def stop_old_servers():
    free_port(PORT)
    try:
        out = subprocess.check_output(["pgrep", "-f", "habit_tracker/serve.py"], text=True)
        my_pid = str(subprocess.os.getpid())
        for pid in out.strip().splitlines():
            if pid and pid != my_pid:
                try:
                    subprocess.os.kill(int(pid), 15)
                except OSError:
                    pass
    except subprocess.CalledProcessError:
        pass


if __name__ == "__main__":
    stop_old_servers()

    ips = lan_ips()
    PRIMARY_IP = ips[0][1] if ips else None

    if PRIMARY_IP:
        config = write_lan_config(PRIMARY_IP)
        canonical = config["canonicalUrl"]
    else:
        canonical = f"http://127.0.0.1:{PORT}/index.html"

    try:
        httpd = ThreadingServer(("0.0.0.0", PORT), Handler)
    except OSError as e:
        print(f"无法启动端口 {PORT}: {e}", file=sys.stderr)
        sys.exit(1)

    print()
    print("=" * 52)
    print("  伴芽 HabitTracker · 局域网服务")
    print("=" * 52)
    print("  统一访问地址（电脑 + 手机都用这个）：")
    print(f"  {canonical}")
    print()
    print("  数据保存在电脑: habit_tracker/data/state.json")
    print("  手机与电脑会自动同步（需保持本服务运行）")
    print("-" * 52)
    print("  按 Ctrl+C 停止")
    print("=" * 52)
    print(flush=True)

    try:
        webbrowser.open(canonical)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")
        httpd.shutdown()
