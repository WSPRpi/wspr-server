from tornado.websocket import WebSocketHandler
from json import loads as load_json

class ConfigEndpoint(WebSocketHandler):
	def send_data(self, key, value):
		self.write_message({
			'name': key,
			'value': value
		})

	def initialize(self, state=None):
		self.state = state

	def open(self):
		self.state.software_listeners.add(self)
		for key, value in self.state.get_state().items():
			self.send_data(key, value)

	def on_message(self, data):
		message = load_json(data)
		self.state.set_from_software(message['name'], message['value'])

	def on_state_change(self, key, value):
		self.send_data(key, value)

	def on_close(self):
		self.state.software_listeners.remove(self)
