from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.crop import CropRatioUpdate
from src.models.packaging import PackagingData
from src.models.product import UpdateProduct
from src.models.product import AddProduct

router = APIRouter(prefix="/product", tags=["product"])


# ----------------------------------------
# UPDATE CROP RATIO FOR A PRODUCT
# ----------------------------------------
@router.put("/update_crop_ratio/{product_id}/{crop_id}")
async def update_crop_ratio(product_id: int, crop_id: int,
                            data: CropRatioUpdate):
    '''
    Update crop ratio given the packaging and crop id.
    Example: PUT /product/update_crop_ratio/101/1
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("update_composed_of", (product_id, crop_id,
                                               data.crop_ratio))
        db.commit()
        return {"message": "Crop ratio was updated succesfully."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        db.close()


# ----------------------------------------
# UPDATE PACKAGING INFORMATION FOR A
# PRODUCT
# ----------------------------------------
@router.put("/update_packaging/{package_name}")
async def update_packaging(package_name: str, data: PackagingData):
    '''
    Update packaging type given the packaging id.
    Example: PUT /product/update_packaging/4
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        # Get the package ID
        cursor.execute("SELECT get_package_id(%s) AS id", (package_name,))
        result = cursor.fetchone()
        if result is None or result["id"] is None:
            raise HTTPException(status_code=500,
                                detail=f"{package_name} does not exist")
        package_id = result["id"]

        cursor.callproc("update_packaging", (package_id, data.size_type))
        db.commit()
        return {"message": "Package type updated succesfully."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        db.close()


# ----------------------------------------
# ADD PACKAGING INFORMATION TO A
# PRODUCT
# ----------------------------------------
@router.post("/add_packaging")
async def add_packaging(data: PackagingData):
    '''
    Add new packaging type.
    Example: POST /product/add_packaging
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("add_packaging", (data.size_type,))
        db.commit()
        return {"message": "New package type added succesfully."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        db.close()


# ----------------------------------------
# UPDATE PRODUCT INFORMATION
# ----------------------------------------
@router.put("/update_product/{product_name}/{package_name}")
async def update_product(product_name: str, package_name: str,
                         data: UpdateProduct):
    '''
    Update product given the product id.
    Example: PUT /product/update_product/101/1
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        # Get the package ID
        cursor.execute("SELECT get_package_id(%s) AS id", (package_name,))
        result = cursor.fetchone()
        if result is None or result["id"] is None:
            raise HTTPException(status_code=500,
                                detail=f"{package_name} does not exist")
        package_id = result["id"]

        # Get the product ID
        cursor.execute("SELECT get_product_id(%s, %s) AS id",
                       (product_name, package_id))
        result = cursor.fetchone()
        if result is None:
            raise HTTPException(status_code=400,
                                detail=f"{product_name} does not exist")
        product_id = result["id"]

        cursor.callproc("update_product", (
            product_id,
            data.product_name,
            data.weight_grams,
            data.is_active,
            data.package_id
            ))
        db.commit()
        return {"message": "Product updated succesfully."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        db.close()


# ----------------------------------------
# ADD A NEW PRODUCT TO THE SYSTEM
# ----------------------------------------
@router.post("/add_product")
async def add_product(data: AddProduct):
    '''
    Add new product.
    Example: POST /product/add_product
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("add_product_offering", (
            data.product_name,
            data.weight_grams,
            data.is_active,
            data.package_id
            ))
        db.commit()

        # Get the product ID
        cursor.execute("SELECT get_product_id(%s, %s) AS id",
                       (data.product_name, data.package_id))
        result = cursor.fetchone()
        if result is None:
            raise HTTPException(status_code=400,
                                detail=f"{data.product_name} does not exist")
        product_id = result["id"]

        # Insert new product's ratio composition into composed_of table
        for composition in data.list_of_composition:
            crop_id, crop_ratio = composition.crop_id, composition.crop_ratio
            cursor.callproc("add_product_crop_composition", (product_id,
                                                             crop_id,
                                                             crop_ratio))
        db.commit()
        return {"message": "New product type added succesfully."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        db.close()


# ----------------------------------------
# DELETE A PRODUCT FROM THE SYSTEM
# ----------------------------------------
@router.delete("/delete_product/{product_id}")
async def delete_product(product_id: int):
    '''
    Delete a product using product id.
    Example: DELETE /delete_product/105
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        # Due to the ON DELETE RESTRICT relationship between the tables
        # product, contains, and composed_of:
        # First delete product form the table contains
        cursor.callproc("delete_from_contains", (product_id,))
        db.commit()
        # Then delete product from the table composed_of
        cursor.callproc("delete_from_composed_of", (product_id,))
        db.commit()
        # Finalize by deleting product from the product table
        cursor.callproc("delete_product", (product_id,))
        db.commit()
        return {"message": "Product has been succesfully deleted."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        db.close()


# ----------------------------------------
# DELETE A PRODUCT FROM THE SYSTEM
# ----------------------------------------
@router.get("/product_names")
async def get_product_names():
    '''
    Get the names of all products
    Example: GET /products/product_names
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_all_product_name")
        result = cursor.fetchall()
        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to get product name")
    finally:
        db.close()

    return result
