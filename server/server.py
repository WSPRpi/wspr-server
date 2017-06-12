#!/usr/bin/env python3

from flask import Flask, jsonify, render_template
import sqlite3 as sql
server = Flask(__name__)

@server.route('/spots')
def spots():
	connection = sql.connect('file:spot-cache.db?mode=ro', uri=True)
	connection.row_factory = sql.Row
	cursor = connection.cursor()
	rows = cursor.execute('SELECT * FROM spots')
	return jsonify({
		'spots': [dict(r) for r in rows]
	})

@server.route('/')
def home():
	return render_template('index.html')

if __name__ == '__main__':
	server.run()
