from urllib.parse import urlparse

import psycopg2
from flask import Flask, jsonify, Blueprint
import os

get_building = Blueprint('/get_buildings', __name__)
get_accessible_door = Blueprint('/get_accessible_doors', __name__)
app = Flask(__name__)


def get_db_connection():
    # return psycopg2.connect(
    #     dbname=os.getenv('DB_NAME'),
    #     user=os.getenv('DB_USER'),
    #     password=os.getenv('DB_PASSWORD'),
    #     host=os.getenv('DB_HOST'),
    #     port=os.getenv('DB_PORT'),
    # )
    database_url = os.getenv('DB_URL')

    # Parse the URL to extract the components
    result = urlparse(database_url)

    # Create the connection using parsed components
    return psycopg2.connect(
        dbname=result.path[1:],  # Remove the leading '/' from the dbname
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port
    )

@get_building.route('/buildings', methods=['GET'])
def get_buildings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, "
                   "CAST(lat AS FLOAT) as lat, "
                   "CAST(lng as FLOAT) as lng "
                   "FROM buildings;")
    buildings = cursor.fetchall()
    conn.close()
    print(buildings)

    return jsonify([{ "name": row[0], "lat": row[1], "lng": row[2]} for row in buildings])

@get_accessible_door.route('/accessible-doors', methods=['GET'])
def get_accessible_doors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id,"
                   "name,"
                   "CAST(lat as FLOAT) as lat, "
                   "CAST(lng as FLOAT) as lng, "
                   "image_path "
                   "FROM accessible_doors;")
    accessible_doors = cursor.fetchall()
    conn.close()
    return jsonify([{"id": row[0],  "name": row[1], "lat": row[2], "lng": row[3], "image_path": row[4]} for row in accessible_doors])

if __name__ == "__main__":
    app.run(debug=True)