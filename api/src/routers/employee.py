from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.employee import EmployeeData

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
    Example: PUT /update_employee/10
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
