from tornado.escape import json_encode
from tornado.web import RequestHandler, StaticFileHandler
from pkg_resources import resource_string
import pkgutil

class IndexEndpoint(RequestHandler):
	def get(self):
		self.write(resource_string('static', 'index.html'))

class BundleEndpoint(RequestHandler):
	def get(self):
		self.write(resource_string('static', 'bundle.js'))

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
