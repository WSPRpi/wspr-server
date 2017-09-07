#!/usr/bin/env python3

from tornado.web import Application as WebApp
from tornado.ioloop import IOLoop as IO

from web_endpoints import *
from shared_state import SharedState
from hardware import Hardware

class MockSerial:
	def __init__(self, *args, **kwargs):
		self.responses = Queue()

	def readline(self):
		return '{};\n'.format(self.responses.get()).encode('ascii')

	def write(self, data):
		pass

if __name__ == '__main__':
	state = SharedState()
	hardware = Hardware(state)
	state.hardware_listener = hardware
	app = WebApp([
		(r'/()', IndexEndpoint),
		(r'/static/(.*)', StaticEndpoint),
		(r'/spots', SpotEndpoint),
		(r'/config', ConfigEndpoint, {'state': state})
	])
	app.listen(8080)

	hardware.go()
	IO.current().start()
