import logging as log

class Router:
	def __init__(self):
		self._state = {
                        'hostname': 'localhost',
                        'ip': '0.0.0.0',
			'callsign': '',
			'gps': 'AA00aa',
			'locator': 'GPS',
			'power': 10,
			'bandhop': ['0'] * 24,
			'tx_disable': ['0'] * 12,
			'tx_percentage': 20,
			'status': 'Loading...',
			'version': '',
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

	def software_upgrade(self):
		log.debug('client requested software upgrade')
		self.hardware_listener.software_upgrade()

	def firmware_upgrade(self):
		log.debug('client requested firmware upgrade')
		self.hardware_listener.firmware_upgrade()

	def upgrade_log(self, message):
		for listener in self.software_listeners:
			listener.on_upgrade_log(message)

	def upgrade_success(self):
		for listener in self.software_listeners:
			listener.on_upgrade_success()

	def heartbeat(self):
		for listener in self.software_listeners:
			listener.on_heartbeat()
