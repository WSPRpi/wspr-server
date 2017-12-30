import logging as log
import os
from signal import signal, SIGINT, SIGTERM
from sys import exit
from tornado.web import Application as WebApp
from tornado.ioloop import IOLoop as IO, PeriodicCallback

from wspr.web_endpoints import *
from wspr.websocket_endpoints import *
from wspr.router import Router
from wspr.monitor import Monitor

PORT = 8080
monitor = None

def create_app():
	global monitor

	router = Router()
	monitor = Monitor(router)
	router.hardware_listener = monitor

	return WebApp([
		(r'/', IndexEndpoint),
		(r'/bundle.js', BundleEndpoint),
		(r'/spots', SpotEndpoint),
		(r'/config', ConfigEndpoint, {'router': router})
	])

def handle_interrupt(sig, frame):
	log.info('interrupted, shutting down...')
	log.debug('cleaning up...')
	monitor.cleanup()
	log.debug('cleanup done, calling exit()...')
	exit(0)
	
def setup():
	log_level = log.DEBUG if os.environ.get('WSPR_DEBUG') else log.INFO
	log.basicConfig(format='%(levelname)s:\t%(message)s', level=log_level)
	signal(SIGINT, handle_interrupt)
	signal(SIGTERM, handle_interrupt)

def run():
	setup()
	log.debug('application startup...')

	app = create_app()
	log.debug('application created')
	app.listen(PORT)
	log.info('application listening on port %d', PORT)

	log.debug('hardware monitor start...')
	monitor.go()
	PeriodicCallback(monitor.heartbeat, 1000).start()
	log.debug('monitor started')

	log.debug('starting I/O loop...')
	IO.current().start()
