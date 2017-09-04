#!/usr/bin/env python3

from threading import Thread
import socket

import tornado.escape
import tornado.ioloop
import tornado.web
import tornado.websocket
import sqlite3 as sql
import serial
import subprocess
import time
from queue import Queue
import random

class SpotEndpoint(tornado.web.RequestHandler):
	def get(self):
		def extract_arg(name):
			return (self.get_arguments(name) or [None])[0]

		callsign1 = extract_arg('callsign1')
		callsign2 = extract_arg('callsign2')
		when = extract_arg('when')

		query = '''
SELECT * FROM spots WHERE
	datetime(timestamp, 'unixepoch') > datetime('now', ?) AND
	(callsign = ? OR callsign = ? OR
         reporter = ? OR reporter = ?)
		'''

		connection = sql.connect('file:spot-cache.db?mode=ro', uri=True)
		connection.row_factory = sql.Row
		rows = connection.execute(query, [
			when,
			callsign1,
			callsign2,
			callsign1,
			callsign2
		])
		spots = [dict(r) for r in rows]
		self.write(tornado.escape.json_encode({'spots': spots}))

class HardwareStateManager:
	def __init__(self):
		self.callsign = 'W4NKR' # C, 10 or fewer, 0 or 1 slash only, 1 to 3 before slash, if at end, either one alphanumeric, two numeric (>= 10), main callsign must have number in second/third character
		self.locator = 'GPS' # L, 6 character, or 'GPS'
		self.power = 20 # P, 0-60 integral, LSB must be in 0, 3, 7, ALSO CALCULATE mW.
		self.frequency = 1337 # F, frequency if not band, always exactly 8, in Hz, maximum 30 million.
		self.tx_percentage = 20 # X, 0-100, multiple of 10, 3 digits
		self.band_hop = ['0'] * 24 # B, comma separated array of either 0-9 ascii, or 'O' for other
		self._state = {
			'callsign': 'W4NKR',
			'locator': None,
			'power': 0.1,
			'band': '10m',
			'tx_percentage': 2,
			# T pic -> pi timestamp in date format
			'status': 'Loading...' # add S option, arbitrary string
		}
		self.listeners = []

	@property
	def state(self):
		return self._state

	@state.setter
	def state(self, state):
		self._state = state

class SerialBaseHandler:
	def __init__(self):
		pass

	def handle(self, data):
		raise NotImplementedError()

class HostnameHandler(SerialBaseHandler):
	def __init__(self):
		super().__init__()

	def handle(self, data):
		hostname = socket.gethostname()
		return ('H', hostname)

class IPHandler(SerialBaseHandler):
	def __init__(self):
		super().__init__()

	def handle(self, data):
		ip = subprocess.check_output(['hostname' , '-I'])\
			.decode('ascii')\
			.strip()
		return ('I', ip)

class CallsignHandler(SerialBaseHandler):
	def __init__(self):
		super().__init__()

	def handle(self, data):
		print("Callsign: {}".format(data))
		return None

class SerialMonitor:
	def __init__(self, Serial):
		self.serial = Serial(
			port='/dev/ttyAMA0',
			baudrate=115200,
			parity=serial.PARITY_NONE,
			stopbits=serial.STOPBITS_ONE,
			bytesize=serial.EIGHTBITS
		)
		self.handlers = {}

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

		returned = handler.handle(rest)
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

class MockSerial:
	def __init__(self, *args, **kwargs):
		self.responses = Queue()

	def readline(self):
		return '{};\n'.format(self.responses.get()).encode('ascii')

	def write(self, data):
		pass

class ConfigEndpoint(tornado.websocket.WebSocketHandler):
	def initialize(self, manager=None):
		if manager is None:
			raise ArgumentException()
		self.manager = manager

	def open(self):
		self.write_message('C{};'.format(self.manager.state['callsign']))
		self.write_message('L{};'.format(self.manager.state['locator']))
		self.write_message('P{};'.format(self.manager.state['power']))
		self.write_message('B{};'.format(self.manager.state['band']))
		self.write_message('T{};'.format(self.manager.state['tx_percentage']))

if __name__ == '__main__':
	manager = HardwareStateManager()
	hardware = SerialMonitor(MockSerial)
	hardware.register_handler('H', HostnameHandler())
	hardware.register_handler('I', IPHandler())
	hardware.register_handler('C', CallsignHandler())

	app = tornado.web.Application([
		(r'/()', tornado.web.StaticFileHandler, {
			'path': 'server/',
			'default_filename': 'index.html'
		}),
		(r'/static/(.*)', tornado.web.StaticFileHandler, {
			'path': 'server/static/'
		}),
		(r'/spots', SpotEndpoint),
		(r'/config', ConfigEndpoint, {'manager': manager})
	])
	app.listen(8080)
	hardware.go()
	tornado.ioloop.IOLoop.current().start()
