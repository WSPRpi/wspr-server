import logging as log

class SharedState:
	def __init__(self):
		self._state = {
                        'hostname': 'localhost',
                        'ip': '0.0.0.0',
			'callsign': 'W4NKR',
			'locator': 'GPS',
			'power': 10,
			'bandhop': ['0'] * 24,
			'tx_percentage': 20,
			'status': 'Loading...'
		}
		self.hardware_listener = None
		self.software_listeners = set()
		log.debug('shared state initialised')

	def get_state(self):
		return self._state

	def set_from_hardware(self, key, value):
		log.debug('hardware changed state: %s = %s', key, value)
		self._state[key] = value
		for listener in self.software_listeners:
			listener.on_state_change(key, value)
		
	def set_from_software(self, key, value):
		log.debug('software changed state: %s = %s', key, value)
		self._state[key] = value
		self.hardware_listener.on_state_change(key, value)
		for listener in self.software_listeners:
			listener.on_state_change(key, value)
