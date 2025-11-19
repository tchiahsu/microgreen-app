from typing import Union

from fastapi import FastAPI

from src.database import connect_db
from src.routers.home import router as home_router

app = FastAPI()

app.include_router(home_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# Testing if the connection to the databse is established through the test-db-connection endpoint.
@app.get("/test-db-connection")
def test_db_connection():
    connection = connect_db()
    if connection:
        connection.close() # close the connection
        return {"Connection was succesful."}
    return {"Connection was unsuccesful."}





