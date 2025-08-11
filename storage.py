import os
from persistent.mapping import PersistentMapping
from ZODB.DB import DB
from zc.lockfile import LockError

# Im TEST_DB-Fall: In-Memory-DemoStorage, sonst FileStorage
if os.environ.get("TEST_DB") == "1":
    from ZODB.DemoStorage import DemoStorage as Storage
    storage = Storage()
else:
    from ZODB.FileStorage import FileStorage as Storage
    DB_FILE = os.path.join(os.path.dirname(__file__), 'data.fs')
    try:
        storage = Storage(DB_FILE)
    except LockError:
        lock_path = DB_FILE + '.lock'
        if os.path.exists(lock_path):
            os.remove(lock_path)
            storage = Storage(DB_FILE)
        else:
            raise

db = DB(storage)

def get_db():
    conn = db.open()
    root = conn.root()
    if 'routes' not in root:
        root['routes'] = PersistentMapping()
        commit_db(conn)
    return conn, root

def close_db(conn):
    conn.close()

def commit_db(conn):
    conn.transaction_manager.commit()
