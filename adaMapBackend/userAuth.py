from flask import Flask, redirect, request, flash, session
import re
from building_routes import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

FRONTEND_URL = "https://adamapdevsite-frontend.onrender.com/"

@app.route('/', methods=["POST"])
def handlerForm():

    conn = get_db_connection()
    cur = conn.cursor()

    if "loginForm" in request.form:
        username = request.form["loginUsername"]
        password = request.form["loginPassword"]

        cur.execute('SELECT * FROM users WHERE username = %s', (username,))
        account = cur.fetchone()

        if account:
            password_rs = account[3]

            if check_password_hash(password_rs, password):
                session['loggedin'] = True
                session['id'] = account['id']
                session['username'] = account['username']

                return redirect(FRONTEND_URL)

        else:
            flash('Incorrect username or password!')
    
    elif "createForm" in request.form:
        username = request.form["createUsername"]
        email = request.form["createEmail"]
        password = request.form["createPassword"]

        _hashed_password = generate_password_hash(password)

        cur.execute('SELECT * FROM users WHERE username = %s', (username,))
        account = cur.fetchone()
        print(account)

        # this one doesnt work
        if account:
            print("Account")
            flash("Account already exists!")
        
        #this one does work
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            print("email")
            flash('Invalid email address!')

        #this one doesnt work
        elif not re.match(r'[A-Za-z0-9]+', username):
            print("username")
            flash('Username must contain only characters and numbers!')

        #this one doesnt work
        elif not username or not password or not email:
            print("blank")
            flash('Please fill out the form!')
        
        elif username == '':
            flash('Please enter a user name')

        cur.execute('INSERT INTO users (username, email, password) VALUES (%s, %s, %s)', (username, email, _hashed_password))
        conn.commit()
        flash('You have successfully registered!')
    
    else:
        flash('Please fill out the form')


    return redirect(FRONTEND_URL)


if __name__ == '__main__':
    app.run(debug=True)