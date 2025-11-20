from typing import Union

from fastapi import FastAPI

from src.database import connect_db
from src.routers.home import router as home_router
from src.routers.product import router as product_router
from src.routers.order import router as order_router
from src.routers.harvest import router as harvest_router
from src.routers.crop import router as crop_router
from src.routers.client import router as client_router
from src.routers.employee import router as employee_router

app = FastAPI()

app.include_router(home_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(harvest_router)
app.include_router(crop_router)
app.include_router(client_router)
app.include_router(employee_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


# Testing if the connection to the databse is established through the
# test-db-connection endpoint.
@app.get("/test-db-connection")
def test_db_connection():
    connection = connect_db()
    if connection:
        connection.close()  # close the connection
        return {"Connection was succesful."}
    return {"Connection was unsuccesful."}
