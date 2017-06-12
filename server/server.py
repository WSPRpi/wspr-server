#!/usr/bin/env python3

from flask import Flask, jsonify, render_template
from werkzeug.routing import BaseConverter
import sqlite3 as sql

server = Flask(__name__)

class ListConverter(BaseConverter):
	def to_python(self, value):
		return value.split('+')

	def to_url(self, values):
		return '+'.join(BaseConverter.to_url(v) for v in values)

server.url_map.converters['list'] = ListConverter

@server.route('/spots/<list:callsigns>')
def spots(callsigns):
	query = '''
SELECT * FROM spots WHERE callsign IN ({ps}) OR reporter IN ({ps})
	'''.format(ps=', '.join(['?'] * len(callsigns)))

	connection = sql.connect('file:spot-cache.db?mode=ro', uri=True)
	connection.row_factory = sql.Row
	rows = connection.execute(
		query,
		callsigns + callsigns
	)
	return jsonify({
		'spots': [dict(r) for r in rows]
	})

@server.route('/')
def home():
	return render_template('index.html')

if __name__ == '__main__':
	server.run()
