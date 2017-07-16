#!/usr/bin/env python3

from threading import Thread
import socket

import tornado.escape
import tornado.ioloop
import tornado.web
import sqlite3 as sql
import serial
import subprocess
import time


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

def handle_stdin(rx_data, ser):
	command = rx_data[0:2].decode('ascii')	
	if command == 'HO':
		hostname = socket.gethostname()
		ser.write(('HO'+hostname+';').encode('ascii'))
	elif command == 'IP':
		#ip = socket.gethostbyname(socket.getfqdn())
		ip = (subprocess.check_output(['hostname' , '-I']).decode('ascii')).strip()
		ser.write(('IP'+ip+';').encode('ascii'))
	else:
		raise NotImplementedError()

def report_serial():
	ser = serial.Serial(
		port='/dev/ttyAMA0',
		baudrate=115200,
		parity=serial.PARITY_NONE,
		stopbits=serial.STOPBITS_ONE,
		bytesize=serial.EIGHTBITS,
	)
	while True:
		command = ser.readline()
		tornado.ioloop.IOLoop.current().add_callback(handle_stdin, command, ser)

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

	#Thread(target=report_serial).start()
	tornado.ioloop.IOLoop.current().start()
