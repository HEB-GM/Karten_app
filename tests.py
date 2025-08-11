import os
import pytest

os.environ["TEST_DB"] = "1"

from app import app
from storage import get_db, close_db, commit_db

@pytest.fixture(autouse=True)
def clear_db():
    conn, root = get_db()
    root['routes'].clear()
    commit_db(conn)
    close_db(conn)
    yield

@pytest.fixture
def client():
    app.config['TESTING'] = True
    return app.test_client()

def test_index_page(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert b'Routenplaner' in rv.data

def test_create_and_list_routes(client):
    payload = {'name':'Test','start':'A','end':'B','path':{'type':'LineString','coordinates':[]}}
    rv = client.post('/api/routes', json=payload)
    assert rv.status_code == 201
    data = rv.get_json()
    assert 'id' in data
    rv2 = client.get('/api/routes')
    assert any(r['name']=='Test' for r in rv2.get_json())

def test_missing_fields_returns_400(client):
    rv = client.post('/api/routes', json={'name':'NurName'})
    assert rv.status_code == 400
    assert 'error' in rv.get_json()
