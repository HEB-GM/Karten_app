import os
import errno
from flask import Flask, render_template, request, jsonify
from persistent import Persistent
from storage import get_db, close_db, commit_db

class Route(Persistent):
    def __init__(self, name, start, end, path):
        self.name = name
        self.start = start
        self.end = end
        self.path = path

app = Flask(__name__, static_folder='static', template_folder='.')

@app.route('/')
def index():
    key = os.environ.get('ORS_API_KEY', '')
    return render_template('index.html', ors_key=key)

@app.route('/api/routes', methods=['GET','POST'])
def routes():
    conn, root = get_db()
    if request.method == 'POST':
        data = request.get_json() or {}
        for f in ('name','start','end','path'):
            if f not in data:
                close_db(conn)
                return jsonify(error=f"Missing {f}"), 400
        rid = str(len(root['routes'])+1)
        root['routes'][rid] = Route(**data)
        commit_db(conn)
        close_db(conn)
        return jsonify(id=rid), 201

    out = [
      {'id':rid,'name':r.name,'start':r.start,'end':r.end,'path':r.path}
      for rid,r in root['routes'].items()
    ]
    close_db(conn)
    return jsonify(out)

from flask_swagger_ui import get_swaggerui_blueprint
swagger_bp = get_swaggerui_blueprint('/docs','/swagger.yaml')
app.register_blueprint(swagger_bp, url_prefix='/docs')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    while True:
        try:
            app.run(host='127.0.0.1', port=port)
            break
        except OSError as exc:
            if exc.errno == errno.EADDRINUSE:
                port += 1
                print(f"Port {port-1} in use, retrying on {port}")
            else:
                raise
