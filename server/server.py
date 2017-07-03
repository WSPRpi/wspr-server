#!/usr/bin/env python3

from threading import Thread
import socket

import tornado.escape
import tornado.ioloop
import tornado.web
import sqlite3 as sql

class SpotHandler(tornado.web.RequestHandler):
	def post(self):
		params = tornado.escape.json_decode(self.request.body)
		callsigns = params['callsigns']
		query = '''
SELECT * FROM spots WHERE callsign IN ({ps}) OR reporter IN ({ps})
		'''.format(ps=', '.join(['?'] * len(callsigns)))

		connection = sql.connect('file:spot-cache.db?mode=ro', uri=True)
		connection.row_factory = sql.Row
		rows = connection.execute(query, callsigns + callsigns)
		spots = [dict(r) for r in rows]
		self.write(tornado.escape.json_encode({'spots': spots}))

def handle_stdin(input):
	command = input[0:2]

	if command == 'HO':
		hostname = socket.gethostname()
		print("HO{};".format(hostname))
	elif command == 'IP':
		ip = socket.gethostbyname(socket.gethostname())
		print("IP{};".format(ip))
	else:
		raise NotImplementedError()

def report_stdin():
	while True:
		command = input()
		tornado.ioloop.IOLoop.current().add_callback(handle_stdin, command)

if __name__ == '__main__':
	app = tornado.web.Application([
		(r'/()', tornado.web.StaticFileHandler, {
			'path': 'server/',
			'default_filename': 'index.html'
		}),
		(r'/static/(.*)', tornado.web.StaticFileHandler, {
			'path': 'server/static/'
		}),
		(r'/spots', SpotHandler),
	])
	app.listen(8080)

	Thread(target=report_stdin).start()
	tornado.ioloop.IOLoop.current().start()
