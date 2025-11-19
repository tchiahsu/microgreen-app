import pymysql
import os
from dotenv import load_dotenv 

load_dotenv()

def connect_db():
    """
        Function helps to establish a connection with the microgreens_db database.
        It gathers the user information from the env file (such as password) to connect to the database.
        Returns the connection if successful otherwise, prints an error message and returns None.
    """
    try:
        db_connection = pymysql.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            db=os.getenv("DB_NAME"),
            port=int(os.getenv("DB_PORT", 3306)),
            charset="utf8mb4", # character encoding to read multiple formats of text
            cursorclass=pymysql.cursors.DictCursor, # return info as dicts not tuples, easier for JSON formatting
        )
        print("Connection to database successful")
        return db_connection
    except pymysql.MySQLError as e:
        print("Connection to database failed: ", e)
        return None

