# Python 3 server example
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request
import time
import json

serverPort = 4000
folderPath = "/home/lights/"
hostName = "10.0.0.102"
#folderPath = "C:/Users/ajdib/Downloads/lights/"
#hostName = "0.0.0.0"

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            f = open(folderPath+"index.html", "rb")
            self.wfile.write(f.read())
            f.close()
        elif self.path == "/default.png":
            self.send_response(200)
            self.send_header("Content-type", "image/png")
            self.end_headers()
            f = open(folderPath+"SFMG.png", "rb")
            self.wfile.write(f.read())
            f.close()
        elif self.path == "/user":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            f = open(folderPath+"user.json", "rb")
            self.wfile.write(f.read())
            f.close()
        elif self.path == "/odometer.js":
            self.send_response(200)
            self.send_header("Content-type", "application/javascript")
            self.end_headers()
            f = open(folderPath+"odometer.js", "rb")
            self.wfile.write(f.read())
            f.close()
        elif self.path == "/odometer.css":
            self.send_response(200)
            self.send_header("Content-type", "text/css")
            self.end_headers()
            f = open(folderPath+"odometer.css", "rb")
            self.wfile.write(f.read())
            f.close()
        elif self.path == "/settings":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            f = open(folderPath+"settings.json", "rb")
            self.wfile.write(f.read())
            f.close()
        elif self.path == "/favicon.ico":
            self.send_response(200)
            self.send_header("Content-type", "image/x-icon")
            self.end_headers()
            f = open(folderPath+"favicon.ico", "rb")
            self.wfile.write(f.read())
            f.close()
        else:
            self.send_response(404)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            f = open(folderPath+"404.html", "rb")
            self.wfile.write(f.read())
            f.close()

    def do_POST(self):
        if self.path == "/search":
            query = json.loads(self.rfile.read(int(self.headers['Content-Length'])).decode("utf-8"))
            req = urllib.request.Request("https://livecounts.xyz/api/youtube-live-subscriber-count/search/"+query["search"], headers={'User-Agent': 'Mozilla/5.0'})
            content = urllib.request.urlopen(req).read()
            content = json.loads(content)
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(content).encode("utf-8"))
        elif self.path == "/save":
            query = json.loads(self.rfile.read(int(self.headers['Content-Length'])).decode("utf-8"))
            if query['api'] == 'mixerno':
                query['api'] = 'https://mixerno.space/api/youtube-channel-counter/user/'
                query['path'] = "counts[0].count"
            elif query['api'] == 'axern':
                query['api'] = 'https://axern.space/api/get?platform=youtube&type=channel&id='
                query['path'] = "estSubCount"
            elif query['api'] == 'xyz':
                query['api'] = 'https://livecounts.xyz/api/youtube-live-subscriber-count/live/'
                query['path'] = "counts[0]"
            elif query['api'] == 'raw':
                query['api'] = 'https://yt.lemnoslife.com/noKey/channels?part=snippet,statistics&id='
                query['path'] = "items[0].statistics.subscriberCount"
            open(folderPath+"settings.json", "w").write(json.dumps(query))
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(bytes("{\"status\": \"ok\"}", "utf-8"))

if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
