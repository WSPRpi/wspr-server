from subprocess import Popen, PIPE
import os
from time import sleep
from requests import get as download


def execute(log, *args):
    try:
        return Popen(args, stdout=PIPE)
    except FileNotFoundError as e:
        log("error: {} not found".format(args[0]))
        log("{}".format(e))


def software_upgrade(log):
    log("running `pip3 install --upgrade wspr-server`...")
    proc = execute(log, 'pip3', 'install', '--upgrade', 'wspr-server')
    if not proc:
        return False

    for line in proc.stdout:
        log(">\t{}".format(line.decode('utf-8').strip()))
    ret = proc.wait()
    log("pip returned {}".format(ret))

    return not bool(ret)


def firmware_upgrade(log, program_mode):
    try:
        log("checking latest release...")
        release = download('https://api.github.com/repos/wsprpi/PIC32-Firmware/releases/latest').json()
        log("...latest release is {}".format(release['tag_name']))

        log("downloading release file...")
        url = release['assets'][0]['browser_download_url']
        hex = download(url).content
        log("...finished download, saving...")
        with open('/tmp/wspr-firmware.hex', 'wb') as f:
            f.write(hex)
        log("...saved to /tmp/wspr-firmware.hex.")
    except Exception as e:
        log("networking error - as follows")
        log("{}".format(e))
        return False

    program_mode()
    log("running `pic32prog -d /dev/ttyAMA0 -b 115200 /tmp/wspr-firmware.hex`...")
    ret = 0

    if os.environ.get('WSPR_EMULATOR'):
        sleep(5)
    else:
        proc = execute(log, 'pic32prog', '-d', '/dev/ttyAMA0', '-b', '115200', '/tmp/wspr-firmware.hex')
        if not proc:
            return False
        for line in proc.stdout:
            log(">\t{}".format(line.decode('utf-8').strip()))
        ret = proc.wait()

    log("pic32prog returned {}".format(ret))
    log("removing release file...")
    os.remove('/tmp/wspr-firmware.hex')
    log("...removed.")

    return not bool(ret)
