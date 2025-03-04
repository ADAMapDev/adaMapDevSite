from urllib import request
import requests
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import os
load_dotenv()

get_routes = Blueprint('/get_route', __name__)
get_api_keys = Blueprint('/get_api_key', __name__)
get_elevations = Blueprint('/get_elevation', __name__)

app = Flask(__name__)
CORS(app)
@get_api_keys.route('/get-api-key', methods=['GET'])
def get_api_key():
    api_key = os.getenv('api_key')
    if not api_key:
        return jsonify({'error': 'No API key provided'}), 401
    return jsonify({"apiKey": api_key})


@get_routes.route("/get-route", methods=['GET', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def get_route():
    # Gather request parameters from the frontend
    origin_lat = request.args.get('origin_lat')
    origin_lng = request.args.get('origin_lng')
    destination_lat = request.args.get('destination_lat')
    destination_lng = request.args.get('destination_lng')

    # Testing to make sure the coordinates are correct
    print(f"Params received: origin=({origin_lat}, {origin_lng}), destination=({destination_lat}, {destination_lng})")
    # If we do not have one of the coordinates then throw an error
    if not (origin_lat and origin_lng and destination_lat and destination_lng):
        return jsonify({'error' : 'Missing coordinates'}), 400

    # Combine the origin and destination coordinates
    origin = f"{origin_lat},{origin_lng}"
    destination = f"{destination_lat},{destination_lng}"
    # Printing them out for testing
    print(origin)
    print(destination)

    # If the origin or destination are not there then throw an error
    if not origin or not destination:
        return jsonify({"error": "Missing start or end parameters"}), 400

    # Call from the Directions API and turn the response into a json
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&mode=walking&key={os.getenv('api_key')}"
    response = requests.get(url)
    data = response.json()
    print(data)

    # If the json does not have routes in it then throw an error
    if "routes" not in data or not data["routes"]:
        return jsonify({"error": "Missing route parameters"}), 401

    route = data["routes"][0]
    polyline = data["routes"][0]["overview_polyline"]["points"]
    legs = route["legs"]

    return jsonify({
        "polyline": polyline,
        "routes": [{
            "legs": [{
                "steps": [{
                    "html_instructions": step["html_instructions"],
                    "distance": step["distance"],
                    "start_location": step["start_location"]
                } for step in leg["steps"]]
            } for leg in legs]
        }]
    }), 200


    # # Send the polyline to the frontend to decode
    # return jsonify({"polyline": polyline}), 200

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

if __name__ == "__main__":
    app.run(debug=True)