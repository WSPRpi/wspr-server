from tornado.websocket import WebSocketHandler

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

	def on_message(self, message):
		print(message)

	def on_hardware_state_change(self, key, value):
		self.send_data(key, value)

	def on_close(self):
		self.state.software_listeners.remove(self)
