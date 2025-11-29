from fastapi import APIRouter, HTTPException, Query
from datetime import date, timedelta
from src.database import connect_db


router = APIRouter(prefix="/harvests", tags=["harvests"])


def get_week(input_date: date):
    '''
    Gets the starting and ending day for the given date.
    Returns a tuple with the dates.
    '''
    # Monday = 0, Sunday = 6
    weekday = input_date.weekday()
    week_start = input_date - timedelta(days=weekday)
    week_end = week_start + timedelta(days=4)
    return week_start, week_end


# ----------------------------------------
# GET ALL CROPS HARVESTED AND PRODUCTS
# FOR EACH HARVEST DAY IN A WEEK
# ----------------------------------------
@router.get("/week")
async def get_harvest(input_date: date | None = Query(default=None)):
    '''
    Shows the harvest for the week for this week if not date is provided.
    Shows the harvest for the week the given date is in.
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed")

    try:
        cursor = db.cursor()

        # Figure out which week to show
        base_date = input_date or date.today()
        week_start, week_end = get_week(base_date)

        # Display the dates that have a harvest
        cursor.execute(
            """
            SELECT DISTINCT delivery_date FROM microgreens_view
            WHERE delivery_date BETWEEN %s AND %s
            ORDER BY delivery_date
            """, (week_start, week_end))
        rows = cursor.fetchall()
        harvest_dates = [row["delivery_date"] for row in rows]

        daily_data = []

        for day in harvest_dates:
            cursor.callproc("get_orders_to_deliver", (day,))
            orders = cursor.fetchall()

            cursor.callproc("get_crops_to_harvest", (day,))
            crops = cursor.fetchall()

            daily_data.append({"date": day, "orders": orders, "crops": crops})
        cursor.close()

        return {
            "week_start": week_start,
            "week_end": week_end,
            "day_data": daily_data
        }
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to view delivery dates")
    finally:
        db.close()


# ----------------------------------------
# GET SUMMARY OF ORDERS TO DELIVER BASED
# ON THE HARVESTS DONE THAT DAY
# ----------------------------------------
@router.get("/get_orders_to_deliver/{delivery_date}")
async def get_orders_to_deliver(delivery_date: date):
    '''
    Get the summary of the orders to deliver for a given date (defaulted to
    today's date)
    Example: GET /home/get_orders_to_deliver/2026-01-01
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_packagings_per_product", (delivery_date, ))
        result = cursor.fetchall()
        cursor.close()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

    return result


# ------------------------------------------
# GET SUMMARY OF CROPS TO HARVEST ON DAY OF
# ------------------------------------------
@router.get("/get_crops_to_harvest/{delivery_date}")
async def get_crops_to_harvest(delivery_date: date):
    '''
    Get the summary of the crops to harvest for a given date (defaulted to
    today's date)
    Example: GET /home/get_crops_to_harvest/2026-01-01
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_crops_to_harvest", (delivery_date, ))
        result = cursor.fetchall()
        cursor.close()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

    return result
