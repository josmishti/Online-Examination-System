import mysql.connector

def dbconnect():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="audemo"
    )
    return conn