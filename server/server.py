#!/usr/bin/env python3

from flask import Flask, jsonify
from shelve import open as open_db
server = Flask(__name__)

def format_spot(spot):
	spot['timestamp'] = int(spot['timestamp'].timestamp())
	return spot

@server.route('/data')
def get_data():
	with open_db('spot-cache.db') as db:
		return jsonify({
			'spots': [format_spot(spot) for spot in db.values()]
		})

# probably inefficient, but who cares?
@server.route('/')
def home():
	with open('index.html') as f:
		return f.read()

if __name__ == '__main__':
	server.run(debug=True)
