from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.employee import EmployeeData, AssignPlanting, AssignDelivery
from src.auth import hash_password

router = APIRouter(prefix="/employees", tags=["employees"])


# ----------------------------------------
# ADD A NEW EMPLOYEE
# ----------------------------------------
@router.post("/add_employee")
async def add_employee(data: EmployeeData):
    '''
    Add a new employee.
    Example: POST /employee/add_employee
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("add_employee", (
            data.ssn,
            data.first_name,
            data.last_name,
            data.email,
            data.title
            ))
        db.commit()
        cursor.close()
        return {"message": "New employee added succesfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


# ----------------------------------------
# UPDATE EMPLOYEE INFORMATION
# ----------------------------------------
@router.put("/update_employee/{employee_id}")
async def update_employee(employee_id: int, data: EmployeeData):
    '''
    Update an employee using employee id.
    Example: PUT /employee/update_employee/10
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("update_employee", (
            employee_id,
            data.ssn,
            data.first_name,
            data.last_name,
            data.email,
            data.title,
            data.is_active
            ))

        if data.password:
            hashed_pw = hash_password(data.password)
            cursor.callproc("update_user_password", (employee_id, hashed_pw))

        db.commit()
        cursor.close()
        return {"message": "Employee info has been succesfully updated."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


# ----------------------------------------
# VIEW ALL EMPLOYEES
# ----------------------------------------
@router.get("/")
async def get_all_employees():
    '''
    Retrieve the name of all active employees
    Example GET /employee/
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("get_employee_names")
        result = cursor.fetchall()
        cursor.close()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

    return result


# ----------------------------
# ASSIGN EMPLOYEE TO DELIVERY
# ----------------------------
@router.put("/assign_delivery")
async def assign_delivery(data: AssignDelivery):
    '''
    Assign an employee to delivery using id and date.
    Example: PUT employee/assign_delivery/1/2025-12-01
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("assign_employee_to_delivery", (data.employee_id,
                                                        data.delivery_date))
        db.commit()
        cursor.close()
        return {"message": "Employee successfully assigned to delivery."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


# ----------------------------
# ASSIGN EMPLOYEE TO PLANTING
# ----------------------------
@router.put("/assign_planting")
async def assign_planting(data: AssignPlanting):
    '''
    Assign an employee to planting using employee and crop id.
    Example: PUT employee/assign_planting/1/1
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("assign_employee_to_planting", (data.employee_id,
                                                        data.crop_id))
        db.commit()
        cursor.close()
        return {"message": "Employee successfully assigned to planting."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()
