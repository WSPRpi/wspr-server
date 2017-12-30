from datetime import datetime
import logging as log
from requests import get as download
from bs4 import BeautifulSoup as TagSoup

URL = 'http://wsprnet.org/olddb'
SCRAPE_ID = 0

def mkparams(call, reporter):
	return {
		'band': 'all',
		'limit': '250',
		'findcall': call,
		'findreporter': reporter,
		'mode': 'html',
		'sort': 'date'
	}

def row_data(date, call, frequency, snr, drift, grid, dbm, w, reporter, reporter_grid, km, miles):
	return {
		'timestamp': datetime.strptime(date, '%Y-%m-%d %H:%M').timestamp(),
		'callsign': call,
		'mhz': float(frequency),
		'snr': int(snr),
		'drift': int(drift),
		'grid': grid,
		'power': float(w),
		'reporter': reporter,
		'reporter_grid': reporter_grid,
		'km': int(km)
	}

def scrape_spots(call, reporter):
	log.debug('scraping spots of %s made by %s...', call, reporter)
	global SCRAPE_ID
	scrape_id = SCRAPE_ID
	SCRAPE_ID += 1
	log.debug('scrape ID %d', scrape_id)

	log.debug('scrape %d: downloading...', scrape_id)
	params = mkparams(call, reporter)
	doc = download(URL, params=params).text
	log.debug('scrape %d: download complete', scrape_id)

	log.debug('scrape %d: parsing data...', scrape_id)
	data = [[x.get_text().strip() for x in row.find_all('td')] for row in TagSoup(doc, 'html.parser').find_all('table')[-1].find_all('tr')]
	rows = [row_data(*row) for row in data if len(row) == 12]
	log.debug('scrape %d: complete, %d spots retrieved', scrape_id, len(rows))
	return rows
