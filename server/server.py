#!/usr/bin/env python3

from flask import Flask, jsonify, render_template
from shelve import open as open_db
server = Flask(__name__)

def format_spot(spot):
	spot['timestamp'] = int(spot['timestamp'].timestamp())
	return spot

@server.route('/spots')
def spots():
	with open_db('spot-cache.db') as db:
		return jsonify({
			'spots': [format_spot(spot) for spot in db.values()]
		})

@server.route('/')
def home():
	return render_template('index.html')

if __name__ == '__main__':
	server.run()
