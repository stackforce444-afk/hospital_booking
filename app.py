from flask import Flask, render_template, redirect, url_for, request, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, UserMixin, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os

# Import models
from models import db, User, Doctor, Patient, Appointment

# Initialize Flask app
app = Flask(__name__)

# Home route
@app.route('/')
def home():
    return render_template('index.html')

if __name__=='__main__':
    app.run(debug=True)

# Set the secret key to keep the session secure
app.secret_key = os.getenv("SECRET_KEY", "supersecret")

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://hospitaluser:hospital123@localhost/hospital_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)  # Initialize the database instance with the Flask app
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# User Loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Registration route
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            flash("⚠️ Username already exists.")
            return redirect(url_for('register'))
        
        # Hash password and create new user
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        flash("✅ Registration successful. You can now log in.")
        return redirect(url_for('login'))
    return render_template('register.html')

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):  # Check password
            login_user(user)
            flash('✅ Logged in successfully!')
            return redirect(url_for('dashboard'))
        else:
            flash('⚠️ Invalid username or password.')
    return render_template('login.html')

# Dashboard route for logged-in users
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

# Logout route
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('✅ Logged out successfully!')
    return redirect(url_for('login'))

# Run the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables are created before starting
    app.run(debug=True)
