from json import loads as load_json
import logging as log
from tornado.websocket import WebSocketHandler


class ConfigEndpoint(WebSocketHandler):
    def send_data(self, key, value):
        log.debug('sending data to client: %s = %s', key, value)
        self.write_message({
            'name': key,
            'value': value
        })

    def initialize(self, router=None):
        self.router = router

    def open(self):
        log.debug('new client socket opened')
        self.router.register_software(self)
        for key, value in self.router.get_state().items():
            self.send_data(key, value)

    def on_message(self, data):
        message = load_json(data)

        if message['name'] == 'software-upgrade':
            self.router.software_upgrade()
            return
        elif message['name'] == 'firmware-upgrade':
            self.router.firmware_upgrade()
            return

        self.router.set_from_software(message['name'], message['value'])

    def on_state_change(self, key, value):
        self.send_data(key, value)

    def on_upgrade_log(self, message):
        self.send_data('upgrade-log', message)

    def on_upgrade_success(self):
        self.send_data('upgrade-success', '')

    def on_heartbeat(self):
        self.send_data('heartbeat', '')

    def on_close(self):
        log.debug('client socket closed')
        self.router.detach_software(self)
