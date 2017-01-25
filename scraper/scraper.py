#!/usr/bin/env python3

from urllib.parse import urlencode
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup as TagSoup
from datetime import datetime, timedelta
from shelve import open as open_db

URL = 'http://dev.wsprnet.org/drupal/wsprnet/spots'
PARAMS = {
	'band': 'All',
	'count': '1000',
	'timelimit': '60',
}
CULL = timedelta(hours=1)
REPEAT = 15

def row_data(row):
	columns = [column.contents[0].strip() for column in row.contents]
	timestamp = datetime.strptime(
		columns[0],
		'%Y-%m-%d %H:%M'
	)
	callsign = columns[1]
	mhz = float(columns[2])
	snr = int(columns[3])
	drift = int(columns[4])
	grid = columns[5]
	power = float(columns[6])
	reporter = columns[7]
	reporter_grid = columns[8]
	km = int(columns[9])
	az = int(columns[10])

	return {
		'timestamp': timestamp,
		'callsign': callsign,
		'mhz': mhz,
		'snr': snr,
		'drift': drift,
		'grid': grid,
		'power': power,
		'reporter': reporter,
		'reporter_grid': reporter_grid,
		'km': km,
		'az': az
	}

def spots():
	params = urlencode(PARAMS).encode('ascii')
	request = Request(URL, params)
	with urlopen(request) as response:
		soup = TagSoup(response.read(), 'lxml')
		table = soup.find('table')
		rows = iter(table.find_all('tr'))
		next(rows)
		for row in rows:
			yield row_data(row)

def spot_key(spot):
	return repr(sorted(spot.items()))

def write_data(filename, spots):
	with open_db(filename) as db:
		for spot in spots:
			db[spot_key(spot)] = spot

		# wipe out old records
		now = datetime.now()
		for k, spot in db.items():
			if spot['timestamp'] < now - CULL:
				del db[k]

if __name__ == '__main__':
	from sched import scheduler as Scheduler
	from time import time, sleep

	schedule = Scheduler(time, sleep)
	def run():
		write_data('spot-cache.db', spots())
		print("data written, next in {}s...".format(REPEAT))
		schedule.enter(REPEAT, 1, run)

	run()
	schedule.run()
