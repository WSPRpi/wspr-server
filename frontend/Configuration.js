import $ from 'jquery'
import toastr from 'toastr'

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

class Configuration {
	constructor(props) {
		this.handleMessage = this.handleMessage.bind(this)
		this.setGPS = this.setGPS.bind(this)
		this.unsetGPS = this.unsetGPS.bind(this)

		let {version, status, hostname, ip, form, submit, bandhopper, callsign} = props
		this.version = version
		this.status = status
		this.hostname = hostname
		this.ip = ip
		this.form = form
		this.submit = submit
		this.bandhopper = bandhopper
		this.output_callsign = callsign

		this.callsign = $(this.form[0].elements.callsign)
		this.gps = $(this.form[0].elements.gps)
		this.locator = $(this.form[0].elements.locator)
		this.power = $(this.form[0].elements.power)
		this.tx_percentage = $(this.form[0].elements.tx_percentage)
		this.bandhop = $(this.form[0].elements.bandhop)
		this.txdisable = $(this.form[0].elements.txdisable)

		this.socket = new WebSocket(`ws://${location.host}/config`)
		this.socket.onmessage = this.handleMessage

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

				this.socket.send(JSON.stringify(d))
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
			if(e.target.checked)
				this.setGPS()
			else
				this.unsetGPS()
		})
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
		toastr.info(
			'The WSPR hardware settings are up-to-date.',
			'Hardware Synchronized',
			{
				preventDuplicates: true,
				positionClass: 'toast-bottom-right'
			}
		)
		this.form.validator('validate')
		this.submit.prop('disabled', true)
	}

	handleMessage(event) {
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
		default:
			console.error("unexpected config packet...")
			console.error(data)
		}
	}
}

export default Configuration
