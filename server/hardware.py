import socket
import subprocess
from threading import Thread

import serial
# from serial import Serial
from fake_hardware import Serial

class Hardware:
	def __init__(self, state):
		self.state = state
		self.serial = Serial(
			port='/dev/ttyAMA0',
			baudrate=115200,
			parity=serial.PARITY_NONE,
			stopbits=serial.STOPBITS_ONE,
			bytesize=serial.EIGHTBITS
		)
		self.handlers = {
			'H': self.handle_hostname,
			'I': self.handle_ip,
			'C': self.handle_callsign
		}

	def handle_hostname(self, data):
		hostname = socket.gethostname()
		return ('H', hostname)

	def handle_ip(self, data):
		ip = subprocess.check_output(['hostname' , '-I'])\
			.decode('ascii')\
			.strip()
		return ('I', ip)

	def handle_callsign(self, data):
		pass

	def route_command(self, data):
		data = data.decode('ascii')
		command = data[0]
		rest = data[1:-2]

		handler = None
		try:
			handler = self.handlers[command]
		except KeyError:
			raise NotImplementedException("no handler for {}".format(command))

		returned = handler.handle(rest)
		if returned is None:
			return

		command, data = returned
		response = '{}{};'.format(command, data).encode('ascii')
		self.serial.write(response)
		
	def poll_serial(self):
		while True:
			data = self.serial.readline()
			IO.current().add_callback(self.route_command, data)

	def go(self):
		target = self.poll_serial
		Thread(target=target).start()
