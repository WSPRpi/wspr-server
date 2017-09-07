from tornado.escape import json_encode
from tornado.web import RequestHandler, StaticFileHandler
from tornado.websocket import WebSocketHandler
import sqlite3 as sql

class StaticEndpoint(StaticFileHandler):
	def initialize(self, *args, **kwargs):
		kwargs['path'] = 'static/'
		super().initialize(*args, **kwargs)

class IndexEndpoint(StaticEndpoint):
	def initialize(self, *args, **kwargs):
		kwargs['default_filename'] = 'index.html'
		super().initialize(*args, **kwargs)

class SpotEndpoint(RequestHandler):
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
		self.write(json_encode({'spots': spots}))

class ConfigEndpoint(WebSocketHandler):
	def initialize(self, state=None):
		pass

	def open(self):
		self.write_message('Hello, world!')
