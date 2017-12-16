from requests import Session as WebSession
from bs4 import BeautifulSoup as TagSoup
from datetime import datetime

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

def scrape_spots():
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
