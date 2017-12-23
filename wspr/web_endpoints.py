from tornado.gen import coroutine
from tornado.escape import json_encode
from tornado.web import RequestHandler, StaticFileHandler
from pkg_resources import resource_string

from concurrent.futures import ThreadPoolExecutor

from .scraper import scrape_spots

class IndexEndpoint(RequestHandler):
	def get(self):
		self.write(resource_string('static', 'index.html'))

class BundleEndpoint(RequestHandler):
	def get(self):
		self.write(resource_string('static', 'bundle.js'))

@coroutine
def collect_spots(callsign1, callsign2):
	with ThreadPoolExecutor() as executor:
		jobs = []
		if callsign1:
			jobs.append(executor.submit(scrape_spots, callsign1, ''))
			jobs.append(executor.submit(scrape_spots, '', callsign1))
		if callsign2:
			jobs.append(executor.submit(scrape_spots, callsign2, ''))
			jobs.append(executor.submit(scrape_spots, '', callsign2))
		results = yield jobs
		return sum(results, [])

class SpotEndpoint(RequestHandler):
	@coroutine
	def get(self):
		callsign1 = self.get_argument('callsign1', default='')
		callsign2 = self.get_argument('callsign2', default='')

		key = lambda x: (x['timestamp'], x['callsign'], x['reporter'])
		spots = yield collect_spots(callsign1, callsign2)
		spots = list({key(x): x for x in spots}.values())
		spots.sort(key=lambda x: x['timestamp'], reverse=True)
		self.write(json_encode({'spots': spots}))
