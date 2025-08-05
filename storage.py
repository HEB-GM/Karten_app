import os, transaction
from persistent.mapping import PersistentMapping
from ZODB.DB import DB

# Im TEST_DB-Fall: In-Memory-DemoStorage, sonst FileStorage
if os.environ.get("TEST_DB") == "1":
    from ZODB.DemoStorage import DemoStorage as Storage
    storage = Storage()
else:
    from ZODB.FileStorage import FileStorage as Storage
    DB_FILE = os.path.join(os.path.dirname(__file__), 'data.fs')
    storage = Storage(DB_FILE)

db = DB(storage)

def get_db():
    conn = db.open()
    root = conn.root()
    if 'routes' not in root:
        root['routes'] = PersistentMapping()
        transaction.commit()
    return conn, root

def close_db(conn):
    conn.close()
