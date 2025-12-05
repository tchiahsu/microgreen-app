import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from src.models.user import RegisterUser, LoginUser
from src.database import connect_db
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from typing import Final

load_dotenv()

router = APIRouter()

JWT_SECRET_KEY: Final[str] = os.environ["JWT_SECRET_KEY"]
JWT_ALGORITHM: Final[str] = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES: Final[int] = 180

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/login")


def hash_password(pw):
    return pwd.hash(pw)


def verify_password(pw, hashed):
    return pwd.verify(pw, hashed)


def create_token(uid):
    payload = {
        "sub": str(uid),
        "exp": datetime.now(timezone.utc) +
        timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


def get_current_employee_id(token: str = Depends(oauth2)):
    try:
        payload = decode_token(token)
        uid = payload.get("sub")
        if uid is None:
            raise HTTPException(status_code=401,
                                detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed")

    try:
        cursor = db.cursor()
        cursor.callproc("get_user_profile_info", (uid,))
        rows = cursor.fetchall()
        cursor.close()
    except Exception:
        db.rollback()
        db.close()
        raise HTTPException(status_code=400,
                            detail="Error retrieving user profile.")
    finally:
        db.close()

    if not rows:
        raise HTTPException(status_code=404,
                            detail="Profile not found for the user.")

    profile = rows[0]

    employee_id = profile.get("employee_id")
    if employee_id is None:
        raise HTTPException(status_code=403,
                            detail="No employee linked to this user.")

    return int(employee_id)


@router.post("/register")
async def register(data: RegisterUser):
    hashed = hash_password(data.password)

    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("register_user", (data.email, hashed))
        cursor.callproc("get_last_registered_user_id")
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=500,
                                detail="Unable to fetch new user id.")
        new_user_id = row["user_id"]

        cursor.callproc("link_employee_user", (data.employee_id, new_user_id))
        db.commit()
        cursor.close()
    except Exception as e:
        db.rollback()
        # raise HTTPException(status_code=400,
        #                     detail="Error registering user.")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

    return {"message": "User Registered successfully."}


# ----------------------------------------
# VERIFY USER LOGIN AND RETRIEVE TOKEN
# ----------------------------------------
@router.post("/login")
async def login(data: LoginUser):
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_user_by_email", (data.email,))

        users = cursor.fetchall()

        if not users:
            raise HTTPException(401, "Invalid log in information given.")

        user = users[0]

        if not verify_password(data.password, user["password_hash"]):
            raise HTTPException(401, "Invalid log in information given.")

        token = create_token(user["user_id"])
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Error with user login.")
    finally:
        db.close()

    return {"access_token": token}


# ----------------------------------------
# ASSIGN A USER ID TO AN EMPLOYEE ID
# ----------------------------------------
@router.get("/profile")
async def profile(token: str = Depends(oauth2)):
    try:
        payload = decode_token(token)
        uid = payload["sub"]
    except JWTError:
        raise HTTPException(401, "Invalid token")

    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_user_profile_info", (uid, ))
        result = cursor.fetchall()
    except Exception as e:
        db.rollback()
        print("LOGIN ERROR:", type(e), e)
        raise HTTPException(status_code=400,
                            detail="Error retrieving user profile.")
    finally:
        db.close()

    return result[0]
