from queue import Queue

class Serial:
	def __init__(self, *args, **kwargs):
		self.responses = Queue()

	def readline(self):
		return '{};\n'.format(self.responses.get()).encode('ascii')

	def write(self, data):
		pass
