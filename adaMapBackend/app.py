from flask import Flask, Blueprint
from flask_cors import CORS
from Routes import get_routes_elevation, get_api_keys, get_elevations, get_routes
import sys

app = Flask(__name__)
CORS(app)

# Register the define route from Routes.py
app.register_blueprint(get_routes_elevation, url_prefix='')
app.register_blueprint(get_api_keys, url_prefix='')
app.register_blueprint(get_elevations, url_prefix='')
app.register_blueprint(get_routes, url_prefix='')
@app.route('/')
def hello_world():  # put application's code here
    print(list(sys.modules.keys()))
    return 'Hello World!'


if __name__ == '__main__':
    app.run(debug=True)
