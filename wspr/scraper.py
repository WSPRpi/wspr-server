from requests import get as download
from bs4 import BeautifulSoup as TagSoup
from datetime import datetime

URL = 'http://wsprnet.org/olddb'

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
	doc = download(URL, params=mkparams(call, reporter)).text
	data = [[x.get_text().strip() for x in row.find_all('td')] for row in TagSoup(doc, 'lxml').find_all('table')[-1].find_all('tr')]
	rows = [row_data(*row) for row in data if len(row) == 12]
	return rows
