from fastapi import APIRouter, HTTPException
from src.models.crop import CropData, CropUpdate
from src.database import connect_db

router = APIRouter(prefix="/crops", tags=["crops"])


# ----------------------------------------
# GET ALL CROP DATA
# ----------------------------------------
@router.get("/grow_information")
async def get_crop_data():
    '''
    Get the crop information
    Example: GET /crops/grow_information
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_all_crop_information")
        result = cursor.fetchall()

        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to get crop information")
    finally:
        db.close()

    return result


# ----------------------------------------
# ADD NEW CROP TO CROP DATA
# ----------------------------------------
@router.post("/")
async def add_crop(data: CropData):
    '''
    Add a new crop to the system
    Example POST /crops/
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("add_crop", (data.crop_name,
                                     data.seed_type,
                                     data.sow_rate,
                                     data.overnight_soak,
                                     data.germination_type,
                                     data.days_direct_light,
                                     data.days_indirect_light,
                                     data.rack_grow_days,
                                     data.yield_per_tray,))

        db.commit()
        cursor.close()
        return {"message": "Order added successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to add crop")
    finally:
        db.close()


# ----------------------------------------
# EDIT CROP DATA
# ----------------------------------------
@router.put("/")
async def edit_crop(data: CropUpdate):
    '''
    Edit crop information
    Example PUT /crops/
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("update_crop", (data.crop_id,
                                        data.crop_name,
                                        data.seed_type,
                                        data.sow_rate,
                                        data.overnight_soak,
                                        data.germination_type,
                                        data.days_direct_light,
                                        data.days_indirect_light,
                                        data.rack_grow_days,
                                        data.yield_per_tray,))

        db.commit()
        cursor.close()
        return {"message": "Crop added successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to update crop")
    finally:
        db.close()
