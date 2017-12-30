from subprocess import call

def software_upgrade(log):
	log("running `pip3 install --upgrade wspr-server`...")
	ret = call(['pip3', 'install', '--upgrade', 'wspr-server'])
	log("pip returned {}".format(ret))

	if ret:
		log("software upgrade failed")
		return False
	return True
