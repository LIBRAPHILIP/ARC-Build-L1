import http.server
import ssl
import socketserver

# Set up the HTTP server
Handler = http.server.SimpleHTTPRequestHandler

# Create the server
with socketserver.TCPServer(("", 8443), Handler) as httpd:
    # Wrap the socket with SSL
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile="./localhost.pem", keyfile="./localhost-key.pem")
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    print("Serving HTTPS on port 8443")
    httpd.serve_forever()