from fastapi import APIRouter, HTTPException
from src.database import connect_db
from datetime import date

router = APIRouter(prefix="/home", tags=["home"])


@router.get("/planting_summary/{delivery_date}")
async def get_planting_summary(delivery_date: date):
    '''
    Get the planting summary for a given date (defaulted to today's date)
    Example: GET /home/planting_summary/2026-01-01
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_planting_summary", (delivery_date, ))
        result = cursor.fetchall()
        cursor.close()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

    return result


@router.get("/germination_summary/{delivery_date}")
async def get_germination_summary(delivery_date: date):
    '''
    Get the germination summary for a given date (defaulted to today's date)
    Example: GET /home/germination_summary/2026-01-01
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_germination_summary", (delivery_date, ))
        result = cursor.fetchall()
        cursor.close()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        db.close()

    return result


@router.get("/rack_switch_summary/{delivery_date}")
async def get_rack_switch_summary(delivery_date: date):
    '''
    Get the rack switch summary for a given date (defaulted to today's date)
    Example: GET /home/rack_switch_summary/2026-01-01
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_switch_summary", (delivery_date, ))
        result = cursor.fetchall()
        cursor.close()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        db.close()

    return result
