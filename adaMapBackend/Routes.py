from urllib import request
import requests
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename

from building_routes import get_db_connection

load_dotenv()
UPLOAD_FOLDER = os.path.join("static", "doors")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


get_routes_elevation = Blueprint('/get_route_elevation', __name__)
get_api_keys = Blueprint('/get_api_key', __name__)
get_elevations = Blueprint('/get_elevation', __name__)
get_routes = Blueprint('/get_route', __name__)
post_images = Blueprint('/upload_image', __name__)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)
@get_api_keys.route('/get-api-key', methods=['GET'])
def get_api_key():
    api_key = os.getenv('api_key')
    if not api_key:
        return jsonify({'error': 'No API key provided'}), 401
    return jsonify({"apiKey": api_key})


##  #################################
##  DESCRIPTION: FETCHES FASTEST ROUTE
##  RETURN:
##  #################################
@get_routes.route("get-route", methods=['GET'])
@cross_origin(supports_credentials=True)
def get_route():
    origin_lat = request.args.get('origin_lat')
    origin_lng = request.args.get('origin_lng')
    destination_lat = request.args.get('destination_lat')
    destination_lng = request.args.get('destination_lng')

    if not (origin_lat and origin_lng and destination_lat and destination_lng):
        return jsonify({'error': 'Invalid coordinates'}), 401

    origin = {"location": {"latLng": {"latitude": float(origin_lat), "longitude": float(origin_lng)}}}
    destination = {"location": {"latLng": {"latitude": float(destination_lat), "longitude": float(destination_lng)}}}

    print(origin)
    print(destination)

    if not origin or not destination:
        return jsonify({'error': 'No Origin or Destination'}), 401

    payload = {
        "origin": origin,
        "destination": destination,
        "travelMode": "WALK",
        "computeAlternativeRoutes": False,
        "polylineEncoding": "ENCODED_POLYLINE"
    }

    headers = {
        "Content-type": "application/json",
        "X-Goog-Api-Key": os.getenv('api_key'),
        "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.legs"
    }

    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    if 'routes' not in data or not data.get('routes'):
        return jsonify({"error": "No routes found"}), 404

    print(data)
    route_steps = [
        {
            "html_instructions": step.get("navigationInstruction", {}).get("instructions", "No instruction available"),
            "distance": step["distanceMeters"] * 3.28084,
            "start_location": step["startLocation"]
        }
        for leg in data['routes'][0]['legs']
        for step in leg.get("steps", [])

    ]

    route = data['routes'][0]
    legs = route["legs"]
    return jsonify({
        "polyline": route["polyline"]["encodedPolyline"],
        "duration": legs[0]["duration"],
        "distance": legs[0]["distanceMeters"] * 3.28084,
        "steps": route_steps,
    })


##  ######################################
##  DESCRIPTION: FETCHES MULTIPLE ROUTES
##  RETURNS: ARRAY of ROUTES
##  ######################################
@get_routes_elevation.route("/get-route-elevation", methods=['GET', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def get_route_elevation():
    origin_lat = request.args.get('origin_lat')
    origin_lng = request.args.get('origin_lng')
    destination_lat = request.args.get('destination_lat')
    destination_lng = request.args.get('destination_lng')

    if not (origin_lat and origin_lng and destination_lat and destination_lng):
        return jsonify({'error': 'Invalid coordinates'}), 401

    origin = {"location": {"latLng": {"latitude": float(origin_lat), "longitude": float(origin_lng)}}}
    destination = {"location": {"latLng": {"latitude": float(destination_lat), "longitude": float(destination_lng)}}}

    print(origin)
    print(destination)

    if not origin or not destination:
        return jsonify({"error": "Missing origin or destination coordinates"}), 401

    # Payload for the properties attached to the route request
    payload = {
        "origin": origin,
        "destination": destination,
        "travelMode": "WALK",
        "computeAlternativeRoutes": True,
        "polylineEncoding": "ENCODED_POLYLINE"
    }

    headers = {
        "Content-type": "application/json",
        "X-Goog-Api-Key": os.getenv('api_key'),
        "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.legs"
    }

    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    print(data)

    if 'routes' not in data or not data.get('routes'):
        return jsonify({"error": "No routes found"}), 404

    # Stores all routes calculated
    routes = []

    for route in data["routes"]:
        polyline = route["polyline"]["encodedPolyline"]
        legs = route["legs"]
        distance = legs[0]["distanceMeters"] * 3.28084
        duration = legs[0]["duration"]
        print(legs)

        routes.append({
            "distance": distance,
            "duration": duration,
            "polyline": polyline,
            "routes": [{
                "legs": [{
                    "steps": [{
                        "html_instructions": step.get("navigationInstruction", {}).get("instructions", "No instruction available"),
                        "distance": step["distanceMeters"] * 3.28084,
                        "start_location": step["startLocation"],
                        "end_location": step["endLocation"],
                        "polyline": step["polyline"]["encodedPolyline"],
                    } for step in leg["steps"]]
                } for leg in legs]
            }]
        })

    print(jsonify(routes))
    print(routes)

    return jsonify(routes), 200

##
##  DESCRIPTION: Calls Elevation API
##  RETURNS: Elevation number between 2 points
##
@get_elevations.route("/get-elevation", methods=['GET', 'OPTIONS'])
def get_elevation():
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    print("lag", lat)
    print("lng", lng)
    if not lat or not lng:
        return jsonify({"error": "Missing latitude or longitude"}), 400

    elevation_url = f"https://maps.googleapis.com/maps/api/elevation/json?locations={lat},{lng}&key={os.getenv('api_key')}"

    try:
        response = requests.get(elevation_url)
        data = response.json()

        if data["status"] == "OK" and data["results"]:
            elevation = data["results"][0]["elevation"]
            return jsonify({"elevation": elevation}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401


def allowed_file(filename):
    return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@post_images.route("/upload-door-image", methods=['POST'])
def upload_door_image():
    if 'image' not in request.files or 'door_id' not in request.form:
        return jsonify({"error": "Missing image or door ID"}), 400
    file = request.files['image']
    door_id = request.form['door_id']

    if not door_id:
        return jsonify({'error': 'No door ID'}), 400

    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    relative_path = f"static/doors/{filename}"
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE accessible_doors SET image_path = %s WHERE id = %s ", (relative_path, door_id)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Image uploaded and path saved!', 'path': relative_path}), 200

@post_images.route("/get-image/<int:door_id>", methods=['GET'])
def get_door_image(door_id):
    if not door_id or door_id == 'undefined':
        return jsonify({"error": "Invalid door ID"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM accessible_doors WHERE id = %s", (door_id,))
    door = cur.fetchone()
    cur.close()
    conn.close()

    if door is None:
        return jsonify({"error": "No door found"}), 404

    door_data = {
        'id': door[0],
        'name': door[1],
        'lat': door[2],
        'lng': door[3],
        'image_path': door[4],
    }
    return jsonify(door_data), 200



if __name__ == "__main__":
    app.run(debug=True)