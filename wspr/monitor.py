import logging as log
import os
import serial
import socket
from subprocess import check_output
from threading import Thread
from tornado.ioloop import IOLoop as IO

from wspr.wire_format import for_wire, from_wire
if os.environ.get('WSPR_EMULATOR'):
	from wspr.emulator import Serial, GPIO
else:
	from serial import Serial
	import RPi.GPIO as GPIO

class Monitor:
	def __init__(self, state):
		self.state = state

		log.debug('connecting to serial port...')
		self.serial = Serial(
			port='/dev/ttyAMA0',
			baudrate=115200,
			parity=serial.PARITY_NONE,
			stopbits=serial.STOPBITS_ONE,
			bytesize=serial.EIGHTBITS
		)
		log.debug('connected')

		self.handlers = {
			'H': self.handle_hostname,
			'I': self.handle_ip,
			'C': self.handle_callsign,
			'L': self.handle_locator,
			'P': self.handle_power,
			'B': self.handle_bandhop,
			'D': self.handle_tx_disable,
			'X': self.handle_tx_percentage,
			'S': self.handle_status,
			'T': self.handle_timestamp
		}

		self.startup_messages = [
			('C', ''),
			('L', ''),
			('P', ''),
			('B', ''),
			('D', ''),
			('X', ''),
			('S', ''),
			('T', '')
		]

		self.state_commands = {
			'callsign': 'C',
			'locator': 'L',
			'power': 'P',
			'tx_percentage': 'X',
			'tx_disable': 'D',
			'bandhop': 'B'
		}

		self.GPIO_high = False
		self.GPIO_port = 5
		GPIO.setmode(GPIO.BCM)
		GPIO.setup(self.GPIO_port, GPIO.OUT)

		# populate hostname and IP for the frontend
		self.handle_hostname(None)
		self.handle_ip(None)

	def handle_hostname(self, data):
		log.debug('retrieving hostname...')
		hostname = socket.gethostname()
		log.debug('hostname was %s', hostname)
		self.state.set_from_hardware('hostname', hostname)
		return ('H', hostname)

	def handle_ip(self, data):
		log.debug('retrieving IP...')
		ip = check_output(['hostname' , '-I'])\
			.decode('ascii')\
			.strip()\
			.split(' ')[0]
		log.debug('IP was %s', ip)
		self.state.set_from_hardware('ip', ip)
		return ('I', ip)

	def handle_callsign(self, data):
		self.state.set_from_hardware('callsign', data)

	def handle_locator(self, data):
		self.state.set_from_hardware('locator', data)

	def handle_power(self, data):
		self.state.set_from_hardware('power', int(data))

	def handle_bandhop(self, data):
		self.state.set_from_hardware('bandhop', data.split(','))

	def handle_tx_disable(self, data):
		self.state.set_from_hardware('tx_disable', data.split(','))

	def handle_tx_percentage(self, data):
		self.state.set_from_hardware('tx_percentage', int(data))

	def handle_status(self, data):
		self.state.set_from_hardware('status', data)

	def handle_timestamp(self, data):
		log.debug('setting the system time to %s...', data)
		check_output(['date', '-d', data])
		log.debug('time set')

	def send_data(self, command, rest):
		formatted = for_wire(command, rest)
		self.serial.write(formatted)
		log.debug('command sent: %s%s', command, rest)

	def route_command(self, data):
		command, rest = from_wire(data)
		log.debug('command received: %s%s', command, rest)

		handler = None
		try:
			handler = self.handlers[command]
		except KeyError:
			log.error('no handler for %s', command)
			raise NotImplementedError("no handler for {}".format(command))

		returned = handler(rest)
		if returned is not None:
			self.send_data(*returned)
		
	def manage_serial(self):
		log.debug('sending startup messages...')
		for message in self.startup_messages:
			self.send_data(*message)
		log.debug('startup messages sent')

		log.debug('starting message receive loop...')
		while True:
			data = self.serial.readline()
			IO.current().add_callback(self.route_command, data)

	def go(self):
		self.toggle_GPIO()
		Thread(target=self.manage_serial, daemon=True).start()

	def on_state_change(self, key, value):
		if key in {'bandhop', 'tx_disable'}:
			value = ','.join(value)
		self.send_data(self.state_commands[key], value)

	def toggle_GPIO(self):
		self.GPIO_high = not self.GPIO_high
		GPIO.output(
			self.GPIO_port,
			GPIO.HIGH if self.GPIO_high else GPIO.LOW
		)
		log.debug('GPIO toggled')
