import logging as log
from queue import Queue, Empty
from subprocess import check_output
from time import sleep
from random import randint

from wspr.wire_format import for_wire, from_wire


def get_time_as_string():
    return check_output(['date', '+%T']).decode('ascii').strip()


class Serial:
    def __init__(self, *args, **kwargs):
        log.info('USING EMULATED HARDWARE')
        self.responses = Queue()
        self.responses.put(('I', ''))
        self.responses.put(('H', ''))
        self.responses.put(('C', 'M0WUT'))
        self.responses.put(('G', 'AA00aa'))
        self.responses.put(('L', 'ZZ99zz'))
        self.responses.put(('M', 'G'))
        self.responses.put(('P', '10'))
        self.responses.put(('B', ','.join(['A'] * 24)))
        self.responses.put(('D', ','.join(['0'] * 12)))
        self.responses.put(('X', '010'))
        self.responses.put(('V', 'emulator-0.1'))
        self.responses.put(('S', "EMULATED"))
        self.responses.put(('T', get_time_as_string()))

    def readline(self):
        try:
            command, rest = self.responses.get(timeout=1)
            return for_wire(command, rest)
        except Empty:
            self.responses.put(('A', ''))
            return self.readline()

    def write(self, data):
        data = data + b'\n'  # actual serial library does this for us
        command, rest = from_wire(data)

        if command == 'U' or command == 'F':
            self.responses.put((command, ''))


class GPIO:
    LOW = 0
    HIGH = 1
    BCM = None
    OUT = None

    def setmode(*args, **kwargs):
        pass

    def setup(port, *args, **kwargs):
        log.debug('emulated GPIO #%d setup', port)

    def output(port, value):
        log.debug('GPIO #%d = %d', port, value)

    def cleanup():
        log.debug('GPIO cleaned up')
