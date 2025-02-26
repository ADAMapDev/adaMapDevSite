from flask import Flask, Blueprint
from flask_cors import CORS
from Routes import get_routes, get_api_keys

app = Flask(__name__)
CORS(app)

# Register the define route from Routes.py
app.register_blueprint(get_routes, url_prefix='')
app.register_blueprint(get_api_keys, url_prefix='')
@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


if __name__ == '__main__':
    app.run(debug=True)
