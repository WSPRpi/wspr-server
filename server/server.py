#!/usr/bin/env python3

from tornado.web import Application as WebApp
from tornado.ioloop import IOLoop as IO

from web_endpoints import *
from websocket_endpoints import *
from shared_state import SharedState
from hardware import Hardware

def create_app():
	state = SharedState()
	hardware = Hardware(state)
	state.hardware_listener = hardware
	return (WebApp([
		(r'/()', IndexEndpoint),
		(r'/static/(.*)', StaticEndpoint),
		(r'/spots', SpotEndpoint),
		(r'/config', ConfigEndpoint, {'state': state})
	]), hardware)

if __name__ == '__main__':
	app, hardware = create_app()
	app.listen(8080)
	hardware.go()
	IO.current().start()
