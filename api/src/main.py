from fastapi import FastAPI

from src.routers.home import router as home_router
from src.routers.product import router as product_router
from src.routers.order import router as order_router
from src.routers.harvest import router as harvest_router
from src.routers.crop import router as crop_router
from src.routers.client import router as client_router
from src.routers.employee import router as employee_router
from src.routers.delivery import router as delivery_router

app = FastAPI()

app.include_router(home_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(harvest_router)
app.include_router(crop_router)
app.include_router(client_router)
app.include_router(employee_router)
app.include_router(delivery_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}
