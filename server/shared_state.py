class SharedState:
	def __init__(self):
		self._state = {
			# C, 10 or fewer, 0 or 1 slash only, 1 to 3 before slash, if at end, either one alphanumeric, two numeric (>= 10), main callsign must have number in second/third character
			'callsign': 'W4NKR',

			# L, 6 character, or 'GPS'
			'locator': 'GPS',

			# P, 0-60 integral, LSB must be in 0, 3, 7, ALSO CALCULATE mW.
			'power': 0.1,

			# B, comma separated array of either 0-9 ascii, or 'O' for other
			'band': ['0'] * 24,

			# F, frequency if not band, always exactly 8, in Hz, maximum 30 million.
			'frequency': 1337000,

			# X, 0-100, multiple of 10, 3 digits
			'tx_percentage': 20,

			# S, arbitrary string
			'status': 'Loading...'

			# T, pic -> pi timestamp in `date` format
		}
		self.hardware_listener = None
		self.software_listeners = set()

	def get_value(self, key):
		return self._state[key]

	def set_from_hardware(self, key, value):
		self._state[key] = value
		for listener in self.software_listeners:
			listener.on_state_change(self._state)

	def set_from_client(self, key, value):
		self._state[key] = value
		self.hardware_listener.on_state_change(self._state)
