import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from src.models.user import RegisterUser, LoginUser, LinkEmployeeToUser
from src.database import connect_db
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 180

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/login")

def hash_password(pw):
    return pwd.hash(pw)

def verify_password(pw, hashed):
    return pwd.verify(pw, hashed)

def create_token(uid):
    payload = {
        "sub": str(uid),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


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
        db.commit()
        cursor.close()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Error registering user.")
    finally:
        db.close()
    
    return {"ok": True}


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
@router.post("/link_employee_user")
async def link_employee_user(data: LinkEmployeeToUser):
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    try:
        cursor = db.cursor()
        cursor.callproc=("link_employee_user", (data.employee_id,
                                                data.user_id,))
        db.commit()
        cursor.close()
        return { "message": "User assigned to employee successfully."}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to link Employee to User")
    finally:
        db.close()


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
