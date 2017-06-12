#!/usr/bin/env python3

from requests import Session as WebSession
from bs4 import BeautifulSoup as TagSoup
from datetime import datetime
import sqlite3 as sql

PARAMS = {
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
URL = 'http://wsprnet.org/drupal/wsprnet/spotquery'

# 30-day cull
CULL = 30 * 24 * 60 * 60
# wait 60 seconds between queries
REPEAT = 60

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
	#traverse fucking stupid Drupal form thingy
	session = WebSession()

	#get the correct form build ID
	form = TagSoup(session.get(URL).text, 'lxml').find_all('form')[-1]
	id = form.find('input', {'name': 'form_build_id'}).get('value')

	#set it as a parameter, and request the page again
	PARAMS['form_build_id'] = id
	response = session.post(URL, data=PARAMS)

	soup = TagSoup(response.text, 'lxml')
	table = soup.find('table')
	rows = iter(table.find_all('tr'))
	next(rows)
	for row in rows:
		yield row_data(row)

def write_data(filename, spots):
	schema = '''
CREATE TABLE IF NOT EXISTS spots (
	timestamp INTEGER,
	callsign TEXT,
	mhz REAL,
	snr INTEGER,
	drift INTEGER,
	grid TEXT,
	power REAL,
	reporter TEXT,
	reporter_grid TEXT,
	km INTEGER,
	az INTEGER,

	PRIMARY KEY (callsign, reporter, timestamp, mhz)
	ON CONFLICT REPLACE
)
'''

	connection = sql.connect(filename)
	cursor = connection.cursor()
	cursor.execute(schema)
	cursor.executemany('''
INSERT INTO spots VALUES (
	STRFTIME('%s', DATETIME(:timestamp)),
	:callsign,
	:mhz,
	:snr,
	:drift,
	:grid,
	:power,
	:reporter,
	:reporter_grid,
	:km,
	:az
)
	''', spots)
	cursor.execute('''
DELETE FROM spots WHERE STRFTIME('%s', 'now') - timestamp > :cull
	''', {'cull': CULL})
	connection.commit()
	connection.close()

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
