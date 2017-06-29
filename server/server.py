#!/usr/bin/env python3

from flask import Flask, request, jsonify, render_template
from werkzeug.routing import BaseConverter
import sqlite3 as sql

server = Flask(__name__)

def connect():
	return sql.connect('file:spot-cache.db?mode=ro', uri=True)

@server.route('/callsigns')
def callsigns():
	query = '''
SELECT callsign FROM spots UNION SELECT reporter FROM spots
	'''

	connection = connect()
	rows = connection.execute(query)
	callsigns = [r[0] for r in rows]

	return jsonify({'callsigns': callsigns})

@server.route('/spots', methods=['POST'])
def spots():
	callsigns = request.json['callsigns']
	query = '''
SELECT * FROM spots WHERE callsign IN ({ps}) OR reporter IN ({ps})
	'''.format(ps=', '.join(['?'] * len(callsigns)))

	connection = connect()
	connection.row_factory = sql.Row
	rows = connection.execute(query, callsigns + callsigns)
	spots = [dict(r) for r in rows]

	return jsonify({'spots': spots})

@server.route('/')
def home():
	return render_template('index.html')

if __name__ == '__main__':
	server.run()
