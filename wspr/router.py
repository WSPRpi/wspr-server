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
		self._spots = []
		self.hardware_agent = None
		self._software_agents = set()
		log.debug('shared state initialised')

	def get_state(self):
		return self._state

	def get_spots(self):
		return self._spots

	def register_software(self, software):
		self._software_agents.add(software)

	def detach_software(self, software):
		self._software_agents.remove(software)

	def set_from_hardware(self, key, value):
		log.debug('hardware changed state: %s = %s', key, value)
		self._state[key] = value
		for agent in self._software_agents:
			agent.on_state_change(key, value)
		
	def set_from_software(self, key, value):
		log.debug('software changed state: %s = %s', key, value)
		self._state[key] = value
		self.hardware_agent.on_state_change(key, value)
		for agent in self._software_agents:
			agent.on_state_change(key, value)

	def software_upgrade(self):
		log.debug('client requested software upgrade')
		self.hardware_agent.software_upgrade()

	def firmware_upgrade(self):
		log.debug('client requested firmware upgrade')
		self.hardware_agent.firmware_upgrade()

	def upgrade_log(self, message):
		for agent in self._software_agents:
			agent.on_upgrade_log(message)

	def upgrade_success(self):
		for agent in self._software_agents:
			agent.on_upgrade_success()

	def heartbeat(self):
		for agent in self._software_agents:
			agent.on_heartbeat()

	def add_spots(self, spots):
		max_spots = 1000

		self._spots += spots
		num_spots = len(self._spots)
		if num_spots > max_spots:
			self._spots = self._spots[num_spots - max_spots:]
