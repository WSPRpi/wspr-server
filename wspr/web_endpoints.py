from concurrent.futures import ThreadPoolExecutor
import logging as log
from tornado.web import RequestHandler
from tornado.gen import coroutine
from pkg_resources import resource_string
from re import search as regex
from requests import Session

class IndexEndpoint(RequestHandler):
	def get(self):
		self.write(resource_string('static', 'index.html'))
		log.debug('index page retrieved')

class BundleEndpoint(RequestHandler):
	def get(self):
		self.write(resource_string('static', 'bundle.js'))
		log.debug('frontend js retrieved')

class WebSpotEndpoint(RequestHandler):
	def retrieve(self, params):
		log.debug('beginning web request sequence...')

		url = 'http://wsprnet.org/drupal/wsprnet/spotquery'
		session = Session()
		log.debug('retrieving form ID...')
		content = session.get(url).text
		build_token = regex(
			r'"form_build_id"\s*value="([^"]+)"',
			content
		).group(1)
		log.debug('got form ID: {}'.format(build_token))

		params['form_build_id'] = build_token
		log.debug('downloading spot page...')
		html = session.post(url, data=params).text
		log.debug('...downloaded spot page.')
		return html

	@coroutine
	def get(self):
		params = {
			'band': 'All',
			'count': '1000',
			'call': '',
			'reporter': '',
			'timelimit': '3600',
			'sortby': 'date',
			'sortrev': '1',
			'op': 'Update',
			'form_id': 'wsprnet_spotquery_form'
		}
		for k in self.request.arguments:
			params[k] = self.get_argument(k)
		log.debug('retrieving web spots with params: {}'.format(params))

		with ThreadPoolExecutor(1) as executor:
			html = yield executor.submit(self.retrieve, params)
		self.write(html)
