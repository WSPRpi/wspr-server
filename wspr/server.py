from tornado.web import Application as WebApp
from tornado.ioloop import IOLoop as IO, PeriodicCallback

from wspr.web_endpoints import *
from wspr.websocket_endpoints import *
from wspr.shared_state import SharedState
from wspr.hardware import Hardware

def create_app():
	state = SharedState()
	hardware = Hardware(state)
	state.hardware_listener = hardware
	return (WebApp([
		(r'/', IndexEndpoint),
		(r'/bundle.js', BundleEndpoint),
		(r'/spots', SpotEndpoint),
		(r'/config', ConfigEndpoint, {'state': state})
	]), hardware)

def run():
	app, hardware = create_app()
	app.listen(8080)
	hardware.toggle_GPIO()
	hardware.go()
	PeriodicCallback(hardware.toggle_GPIO, 1000).start()
	IO.current().start()
