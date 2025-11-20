import pymysql
import os
from dotenv import load_dotenv

load_dotenv()


def connect_db():
    '''
    Function helps to establish a connection with the microgreens_db database.
    It gathers the user information from the env file (such as password) to
    connect to the database. Returns the connection if successful otherwise,
    prints an error message and returns None.
    '''
    try:
        password = os.getenv("DB_PASSWORD")
        if password is None:
            raise RuntimeError("DB_PASSWORD not set in environment vairables")

        db_connection = pymysql.connect(  # type: ignore
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=password,
            database=os.getenv("DB_NAME"),
            port=int(os.getenv("DB_PORT", 3306)),
            charset="utf8mb4",  # char encoding to read multiple text formats
            cursorclass=pymysql.cursors.DictCursor,  # return info as dicts
        )
        print("Connection to database successful")
        return db_connection
    except pymysql.MySQLError as e:
        print("Connection to database failed: ", e)
        return None
