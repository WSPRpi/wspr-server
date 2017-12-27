import logging as log
from queue import Queue
from subprocess import check_output
from time import sleep
from random import randint

from wspr.wire_format import for_wire, from_wire

def get_time_as_string():
	return check_output(['date', '+%T']).decode('ascii').strip()

class Serial:
	def __init__(self, *args, **kwargs):
		log.info('USING EMULATED HARDWARE')
		self.responses = Queue()
		self.responses.put(('I', ''))
		self.responses.put(('H', ''))
		self.responses.put(('C', 'M0WUT'))
		self.responses.put(('L', 'GPS'))
		self.responses.put(('P', '10'))
		self.responses.put(('B', ','.join(['2'] * 24)))
		self.responses.put(('D', ','.join(['0'] * 12)))
		self.responses.put(('X', '010'))
		self.responses.put(('V', 'emulator-0.1'))
		self.responses.put(('S', "EMULATED"))
		self.responses.put(('T', get_time_as_string()))

	def jitter(self):
		sleep(0.025 * randint(0, 9))

	def readline(self):
		self.jitter()
		command, rest = self.responses.get()
		return for_wire(command, rest)

	def write(self, data):
		data = data + b'\n' # actual serial library does this for us
		self.jitter()
		command, rest = from_wire(data)

class GPIO:
	LOW = 0
	HIGH = 1
	BCM = None
	OUT = None

	def setmode(*args, **kwargs):
		pass

	def setup(*args, **kwargs):
		pass

	def output(port, value):
		pass
