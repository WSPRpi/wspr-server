from concurrent.futures import ThreadPoolExecutor
import logging as log
from datetime import datetime
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

class SpotEndpoint(RequestHandler):
    def initialize(self, router=None):
        self.router = router

    def get(self):
        callsign1 = self.get_argument('callsign1', default='').upper()
        callsign2 = self.get_argument('callsign2', default='').upper()
        timelimit = int(self.get_argument('timelimit', default='3600'))
        band = self.get_argument('band', default='All')
        unique = self.get_argument('unique', default=None)

        def band_for(freq):
            if freq < 1:
                return -1 if freq < 0.3 else 0
            return str(int(freq))

  # query
        spots = [
            spot
            for spot in self.router.get_spots()
            # callsigns
            if (
                spot['callsign'] == callsign1 or
                spot['callsign'] == callsign2 or
                spot['reporter'] == callsign1 or
                spot['reporter'] == callsign2
            ) and (
            # date
                (datetime.utcnow() - datetime.strptime(spot['timestamp'], '%y%m%d%H%M')).total_seconds() < timelimit
            ) and (
            # band
                band == 'All' or
                band_for(spot['mhz']) == band
            )
        ]

        # sorting done by the frontend since we return all data
        # uniquing done now
        # note there's actually a bug here:
        # if sorting by distance, the first here is not the first by distance
        # however, I don't _think_ this should occur when scraping locally since in principle all distances for the same callsign are the same
        # if not, fuck you and your moving around
        # besides, don't actually have a distance to sort by at this point
        if unique:
            filtered = []
            pairs = set()
            for spot in spots:
                callsign = spot['callsign']
                reporter = spot['reporter']
                if not (callsign, reporter) in pairs:
                    pairs.add((callsign, reporter))
                    filtered.append(spot)
            spots = filtered
        self.write({'spots': spots})

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
            'count': '1000',
            'op': 'Update',
            'form_id': 'wsprnet_spotquery_form'
        }
        for k in self.request.arguments:
            params[k] = self.get_argument(k)
        log.debug('retrieving web spots with params: {}'.format(params))

        with ThreadPoolExecutor(1) as executor:
            html = yield executor.submit(self.retrieve, params)
        self.write(html)
