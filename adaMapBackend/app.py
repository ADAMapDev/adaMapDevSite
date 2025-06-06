from flask import Flask, Blueprint
from flask_cors import CORS
from Routes import get_routes_elevation, get_api_keys, get_elevations, get_routes, post_images
import sys
from building_routes import get_building, get_accessible_door

app = Flask(__name__)
CORS(app, )

# Register the define route from Routes.py
app.register_blueprint(get_routes_elevation, url_prefix='')
app.register_blueprint(get_api_keys, url_prefix='')
app.register_blueprint(get_elevations, url_prefix='')
app.register_blueprint(get_routes, url_prefix='')
app.register_blueprint(get_building, url_prefix='')
app.register_blueprint(get_accessible_door, url_prefix='')
app.register_blueprint(post_images, url_prefix='')
@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


if __name__ == '__main__':
    app.run(debug=True)
