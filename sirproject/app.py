from flask import Flask , render_template, request

from db import dbconnect

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def hello():
    return("this is about pg of app.")

@app.route("/apply", methods = ["GET", "POST"])
def apply():
    if request.method == "POST":
        cn = request.form["name"] 
        u = request.form["username"]
        e = request.form["email"]
        p = request.form["password"]
        pr = request.form["program"]
        c = request.form["contact"]
        conn = dbconnect()
        cur = conn.cursor() 
        query = "insert into applicants (aname, ausername, aemail, password, program, contact) values (%s, %s, %s, %s, %s, %s)"
        cur.execute(query, (cn, u, e, p, pr, c))
        conn.commit()
        

        return "Form submitted successfully!"
    return render_template("apply.html")
@app.route("/success")
def success():
    return render_template("success.html")
@app.route("/login", methods = ["GET", "POST"])
def login():
    if request.method == "POST":
            uname = request.form["un"]
            up = request.form["password"]
            conn = dbconnect()
            cur = conn.cursor() 
            query = "select aname from applications where ausername = %s and password = %s"
            cur.execute(query, (uname, up))
            res = cur.fetchone()
            if res:
                return f"Welcome, {res[0]}!"
            else:
                return "Invalid username or password." 
            
       
    return render_template("login.html")
@app.route("/db")
def testdb():
    conn = dbconnect()
    cur = conn.cursor()
    cur.execute("select 'database connection successful' as msg")
    res = cur.fetchone() 
    cur.close()
    conn.close()

    return res[0]
if __name__ == "__main__":
    app.run(debug=True)
