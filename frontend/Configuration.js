import $ from 'jquery'
import toastr from 'toastr'
import moment from 'moment'

const packageData = require('../package.json')

function callsignCheck($el) {
	let callsign = $el.val().toUpperCase()

	if(!callsign)
		return // checked already

	if(callsign.length > 10)
		return 'callsign must be 10 or fewer characters'

	let slash_count = (callsign.match(/\//g) || []).length 
	if(slash_count >= 2)
		return 'callsign must contain at most one slash'

	let main = null
	if(slash_count == 1) {
		let [first, second] = callsign.split('/')

		if(second.match(/^(([A-Z0-9])|([0-9]{2}))$/)) {
			main = first
		}
		else if(first.match(/^[A-Z0-9]{1,3}$/)) {
			main = second
		}
		else {
			return 'callsign modifiers must either be prefix (between 1 and 3 alphanumeric characters), or suffix (either 1 alpha-numeric, or 2 numeric characters)'
		}
	}
	else
		main = callsign

	if(!main.match(/^..?[0-9]/))
		return 'the main part of the callsign must have a numeric character in the second or third position'
}

function locatorCheck($el) {
	let locator = $el.val()

	if(!locator.match(/^[A-Z][A-Z][0-9][0-9][a-z][a-z]$/) && locator != 'GPS')
		return 'this must be a 6-digit Maidenhead locator'
}

async function reload() {
	await new Promise(r => setTimeout(r, 3000))
	location.reload(true)
}

class Configuration {
	constructor(props) {
		this.handleMessage = this.handleMessage.bind(this)
		this.setGPS = this.setGPS.bind(this)
		this.unsetGPS = this.unsetGPS.bind(this)

		let {software_version, firmware_version, status, hostname, ip, gps, form, submit, bandhopper, callsign, upgrade_software, upgrade_firmware, upgrade_dialog, upgrade_log, lost_contact} = props
		software_version.text(packageData.version)
		this.version = firmware_version
		this.status = status
		this.hostname = hostname
		this.ip = ip
		this.gps_locator = gps
		this.form = form
		this.submit = submit
		this.bandhopper = bandhopper
		this.output_callsign = callsign
		this.upgrade_dialog = upgrade_dialog
		this.upgrade_log = upgrade_log
		this.upgrade_ongoing = false
		this.lost_contact = lost_contact

		this.callsign = $(this.form[0].elements.callsign)
		this.gps = $(this.form[0].elements.gps)
		this.locator = $(this.form[0].elements.locator)
		this.power = $(this.form[0].elements.power)
		this.tx_percentage = $(this.form[0].elements.tx_percentage)
		this.bandhop = $(this.form[0].elements.bandhop)
		this.txdisable = $(this.form[0].elements.txdisable)

		this.socket = new WebSocket(`ws://${location.host}/config`)
		this.socket.onmessage = this.handleMessage
		const send = obj => {
			this.socket.send(JSON.stringify(obj))
		}

		this.form.validator({
			delay: 0,
			custom: {
				callsign: callsignCheck,
				locator: locatorCheck
			}
		})
		this.form.validator().on('submit', e => {
			if(e.isDefaultPrevented())
				return

			e.preventDefault()
			var data = $(e.target).serializeArray()
			data.filter(d => d.name != 'gps').forEach(d => {
				if(d.name == 'callsign')
					d.value = d.value.toUpperCase()
				else if(d.name == 'tx_percentage')
					d.value = d.value.padStart(3, '0')
				else if(d.name == 'bandhop' || d.name == 'tx_disable')
					d.value = d.value.split(',')

				send(d)
			})
			this.submit.prop('disabled', true)
			this.output_callsign.val(this.callsign.val())
			toastr.success(
				'New WSPR configuration written to hardware.',
				'Configuration Saved',
				{
					preventDuplicates: true,
					positionClass: 'toast-bottom-right'
				}
			)
		})

		let enableForm = () => {this.submit.prop('disabled', false)}
		this.form.find('input').on('input change', enableForm)
		this.form.find('select').on('change', enableForm)

		this.gps.change(e => {
			e.target.checked = true
			alert('GPS mandatory for now.')
			/* disabled for now - re-enabled when WUT desires
			if(e.target.checked)
				this.setGPS()
			else
				this.unsetGPS()
			*/
		})

		upgrade_software.on('click', () => {
			if(!confirm("Upgrade the software on your Pi to the latest version?"))
				return;

			send({'name': 'software-upgrade'})
		})
		upgrade_firmware.on('click', () => {
			if(!confirm("Flash the latest firmware onto your WSPR hardware?"))
				return;

			send({'name': 'firmware-upgrade'})
		})

		this.lastHeartbeat = moment.utc()
		setInterval(() => {
			let now = moment.utc()
			let ms = now.diff(this.lastHeartbeat, 'milliseconds')

			if(ms > 5000 && !this.upgrade_ongoing) {
				this.lost_contact.modal({
					backdrop: 'static',
					keyboard: false
				})
			}
		}, 5000)
		
	}

	setGPS() {
		this.gps.prop('checked', true)
		this.locator.prop('readonly', true)
		this.locator.val('GPS')
	}

	unsetGPS() {
		this.gps.prop('checked', false)
		this.locator.prop('readonly', false)
	}

	onSync() {
		this.form.validator('validate')
		this.submit.prop('disabled', true)
	}

	handleMessage(event) {
		this.lastHeartbeat = moment.utc()

		let data = JSON.parse(event.data)
		switch(data.name) {
		case 'version':
			this.version.text(data.value)
			break
		case 'status':
			this.status.text(data.value)
			break
		case 'hostname':
			this.hostname.text(data.value)
			break
		case 'ip':
			this.ip.text(data.value)
			break
		case 'gps':
			this.gps_locator.text(data.value)
			break
		case 'callsign':
			this.callsign.val(data.value)
			this.onSync()
			break
		case 'locator':
			if(data.value == 'GPS')
				this.setGPS()
			else {
				this.unsetGPS()
				this.locator.val(data.value)
			}
			this.onSync()
			break
		case 'power':
			this.power.val(data.value)
			this.onSync()
			break
		case 'tx_percentage':
			this.tx_percentage.val(parseInt(data.value))
			this.onSync()
			break
		case 'bandhop':
			this.bandhopper.setBandhop(data.value)
			this.onSync()
			break
		case 'tx_disable':
			this.bandhopper.setTxDisable(data.value)
			this.onSync()
			break
		case 'upgrade-log':
			this.upgrade_ongoing = true
			this.upgrade_dialog.modal({backdrop: 'static', keyboard: false})
			this.upgrade_log.append(data.value + '\n')
			break
		case 'upgrade-success':
			this.upgrade_ongoing = false
			reload()
			break
		case 'heartbeat':
			break
		default:
			console.error("unexpected config packet...")
			console.error(data)
		}
	}
}

export default Configuration
