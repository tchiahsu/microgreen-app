from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.packaging import UpdatePackaging

router = APIRouter(prefix="/product", tags=["product"])

@router.put("/update_packaging/{package_id}")
def update_packaging(package_id: int, data: UpdatePackaging):
    '''
    Update packaging type given the packaging id.
    Example: PUT /product/update_packaging/4
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Connection to database failed.")
    
    try:
        cursor = db.cursor()
        cursor.callproc("update_packaging_table", (package_id, data.size_type))

        result = cursor.fetchall()
        db.commit()
        cursor.close()
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        db.close()

    return result

