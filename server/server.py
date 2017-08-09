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

class HardwareHandler:
	def __init__(self, Serial):
		self.serial = Serial(
			port='/dev/ttyAMA0',
			baudrate=115200,
			parity=serial.PARITY_NONE,
			stopbits=serial.STOPBITS_ONE,
			bytesize=serial.EIGHTBITS
		)
		self.handlers = {}
		self.serial.write(b'C;')

	def register_handler(self, command, handler):
		self.handlers[command] = handler

	def handle_command(self, data):
		data = data.decode('ascii')
		command = data[0]
		rest = data[1:-2]

		handler = None
		try:
			handler = self.handlers[command]
		except KeyError:
			raise NotImplementedException("no handler for {}".format(command))

		returned = handler(rest)
		if returned is None:
			return

		command, data = returned
		response = '{}{};'.format(command, data).encode('ascii')
		self.serial.write(response)
		
	def poll_serial(self):
		while True:
			data = self.serial.readline()
			ioloop = tornado.ioloop.IOLoop.current()
			ioloop.add_callback(self.handle_command, data)

	def go(self):
		target = self.poll_serial
		Thread(target=target).start()

def hostname_handler(data):
	hostname = socket.gethostname()
	return ('H', hostname)

def ip_handler(data):
	ip = subprocess.check_output(['hostname' , '-I']).decode('ascii').strip()
	return ('I', ip)

def callsign_handler(callsign):
	print("Callsign: {}".format(callsign))
	return None

class MockSerial:
	def __init__(self, *args, **kwargs):
		pass

	def readline(self):
		import time
		time.sleep(1)
		return b'I;\n'

	def write(self, data):
		pass

if __name__ == '__main__':
	hardware = HardwareHandler(MockSerial)
	hardware.register_handler('H', hostname_handler)
	hardware.register_handler('I', ip_handler)
	hardware.register_handler('C', callsign_handler)

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
	hardware.go()
	tornado.ioloop.IOLoop.current().start()
