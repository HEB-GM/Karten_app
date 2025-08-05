import os, transaction
from flask import Flask, render_template, request, jsonify
from persistent import Persistent
from persistent.mapping import PersistentMapping
from ZODB.FileStorage import FileStorage
from ZODB.DB import DB

# ZODB initialisieren
DB_FILE = os.path.join(os.path.dirname(__file__), 'data.fs')
storage = FileStorage(DB_FILE)
db = DB(storage)

class Route(Persistent):
    def __init__(self, name, start, end, path):
        self.name = name
        self.start = start
        self.end = end
        self.path = path

def get_db():
    conn = db.open()
    root = conn.root()
    if 'routes' not in root:
        root['routes'] = PersistentMapping()
        transaction.commit()
    return conn, root

def close_db(conn):
    conn.close()

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
        transaction.commit()
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
    app.run(host='127.0.0.1', port=5000)
