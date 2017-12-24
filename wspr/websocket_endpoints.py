from json import loads as load_json
import logging as log
from tornado.websocket import WebSocketHandler

class ConfigEndpoint(WebSocketHandler):
	def send_data(self, key, value):
		log.debug('sending data to client: %s = %s', key, value)
		self.write_message({
			'name': key,
			'value': value
		})

	def initialize(self, state=None):
		self.state = state

	def open(self):
		log.debug('new client socket opened')
		self.state.software_listeners.add(self)
		for key, value in self.state.get_state().items():
			self.send_data(key, value)

	def on_message(self, data):
		message = load_json(data)
		self.state.set_from_software(message['name'], message['value'])

	def on_state_change(self, key, value):
		self.send_data(key, value)

	def on_close(self):
		log.debug('client socket closed')
		self.state.software_listeners.remove(self)
