class SharedState:
	def __init__(self):
		self._state = {
			'callsign': 'W4NKR',
			'locator': 'GPS',
			'power': 10,
			'band': ['0'] * 24,
			'frequency': 1337000,
			'tx_percentage': 20,
			'status': 'Loading...'
		}
		self.hardware_listener = None
		self.software_listeners = set()

	def get_state(self):
		return self._state

	def set_from_hardware(self, key, value):
		self._state[key] = value
		for listener in self.software_listeners:
			listener.on_state_change(self._state)

	def set_from_client(self, key, value):
		self._state[key] = value
		self.hardware_listener.on_state_change(self._state)
