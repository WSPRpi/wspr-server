def for_wire(command, rest):
	return '{}{};\n'.format(command, rest).encode('ascii')

def from_wire(data):
	data = data.decode('ascii')
	command = data[0]
	rest = data[1:-2]
	return (command, rest)
