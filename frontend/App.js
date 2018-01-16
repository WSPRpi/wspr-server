import SpotSearch from './SpotSearch'
import SpotTable from './SpotTable'
import SpotMap from './SpotMap'
import QTHMap from './QTHMap'
import Configuration from './Configuration'
import Bandhop from './Bandhop'

import Maidenhead from 'maidenhead'
import $ from 'jquery'
import HashRouter from 'hash-router'
import moment from 'moment'

class App {
	constructor() {
		this.fetchData = this.fetchData.bind(this)
		this.update = this.update.bind(this)
		this.spots = []
		this.callsign1 = null
		this.callsign2 = null

		this.search = new SpotSearch({
			input1: $('#callsign-input1'),
			nickname: $('#nickname'),
			input2: $('#callsign-input2'),
			form: $('#callsigns-form'),
			extra_button: $('#callsign-extra-button'),
			extra_dialog: $('#callsign-extra-dialog'),
			extra_form: $('#callsign-extra-form'),
			onUpdate: this.fetchData
		})
		this.table = new SpotTable({
			table: '#spot-table'
		})
		this.map = new SpotMap({
			map: '#spot-map'
		})
		this.qth = new QTHMap({
			map: '#qth-map'
		})
		this.bandhopper = new Bandhop({
			widget: 'bandhopper',
			bandhop: $('#config-bandhop'),
			txdisable: $('#config-tx_disable')
		})
		this.config = new Configuration({
			software_version: $('#config-software-version'),
			firmware_version: $('#config-firmware-version'),
			status: $('#config-status'),
			hostname: $('#config-hostname'),
			ip: $('#config-ip'),
			gps: $('#config-gps'),
			form: $('#config-form'),
			submit: $('#config-submit'),
			bandhopper: this.bandhopper,
			callsign: $('#callsign-input1'),
			upgrade_software: $('#upgrade-software'),
			upgrade_firmware: $('#upgrade-firmware'),
			upgrade_dialog: $('#upgrade-dialog'),
			upgrade_log: $('#upgrade-log'),
			lost_contact: $('#lost-contact')
		})

		// setup routing
		let routeTable = () => {
			$('.page').hide()
			$('#spot-table-page').show()
		}
		let routeSpotMap = () => {
			$('.page').hide()
			$('#spot-map-page').show()
			this.map.draw()
		}
		let routeQTHMap = () => {
			$('.page').hide()
			$('#qth-map-page').show()
			this.qth.draw()
		}
		let routeConfig = () => {
			$('.page').hide()
			$('#config-page').show()
		}

		let router = HashRouter()
		router.addRoute("#/", routeTable)
		router.addRoute("#/table", routeTable)
		router.addRoute("#/spot-map", routeSpotMap)
		router.addRoute("#/qth-map", routeQTHMap)
		router.addRoute("#/config", routeConfig)
		window.addEventListener("hashchange", router)
		router()

		console.log("Finished loading.")
		$('#loading-banner').hide()
	}

	async scrape(params) {
		let endpoint = '/spots?' + $.param(params)
		let rep = await fetch(endpoint)
		let html = await rep.text()

		let doc = document.implementation.createHTMLDocument('scrape')
		doc.documentElement.innerHTML = html
		return $("table tr:gt(0)", doc).map(function() {
			let cells = $("td", this).map(function() {
				return $(this).text().trim()
			}).get()
			return {
				'timestamp': moment.utc(cells[0], "YYYY-MM-DD HH:mm"),
				'callsign': cells[1],
				'mhz': parseFloat(cells[2]),
				'snr': parseInt(cells[3]),
				'drift': parseInt(cells[4]),
				'grid': cells[5],
				'power': parseFloat(cells[6]),
				'reporter': cells[7],
				'reporter_grid': cells[8],
				'km': parseInt(cells[9])
			}
		}).get()
	}

	async scrapeAll(callsign1, callsign2, extra) {
		let calls1 = (callsign1.trim() === '') ? [] :this.scrape({
			call: callsign1,
			reporter: callsign1,
			...extra //ES7 being sassy
		})
		let calls2 = (callsign2.trim() === '') ? [] : this.scrape({
			call: callsign2,
			reporter: callsign2,
			...extra
		})
		return (await calls1).concat(await calls2)
	}

	async fetchData(callsign1, callsign2, extra) {
		$('#callsign-submit').prop('disabled', true)
		this.callsign1 = callsign1
		this.callsign2 = callsign2

		let spots = await this.scrapeAll(callsign1, callsign2, extra)
		if(extra.sortby == 'date') {
			spots.sort((a, b) => {
				if(a.timestamp.isAfter(b.timestamp)) {return 1}
				else if(a.timestamp.isBefore(b.timestamp)) {return -1}
				return 0
			})
		}
		else if(extra.sortby == 'distance') {
			spots.sort((a, b) => {
				if(a.km > b.km) {return 1}
				else if(a.km < b.km) {return -1}
				return 0
			})
		}
		if('sortrev' in extra) {
			spots.reverse()
		}
		function equal(a, b) {
			return (
				a.timestamp.isSame(b.timestamp) &&
				a.call === b.call &&
				a.mhz === b.mhz &&
				a.snr === b.snr &&
				a.drift === b.drift &&
				a.grid === b.grid &&
				a.power === b.power &&
				a.reporter === b.reporter &&
				a.reporter_grid === b.reporter_grid &&
				a.km === b.km
			)
		}
		// de-duplicate spots
		// O(n ^ 2) - so kill me, n = 2000
		for(var i = 0; i < spots.length; ++i) {
			for(var j = i + 1; j < spots.length; ++j) {
				if(equal(spots[i], spots[j])) {
					spots.splice(i + 1, 1)
				}
			}
		}
		this.spots = spots
		this.update()
	}

	update() {
		this.table.update({spots: this.spots})

		let map_spots = this.spots.map(s => ({
			from_location: Maidenhead.toLatLon(s.grid),
			to_location: Maidenhead.toLatLon(s.reporter_grid),
			from: s.callsign,
			to: s.reporter
		}))
		this.map.update({
			spots: map_spots,
			callsign1: this.callsign1,
			callsign2: this.callsign2
		})

		let qth_locations = this.spots.map(s => ({
			location: Maidenhead.toLatLon(s.grid),
			callsign: s.callsign
		})).concat(this.spots.map(s => ({
			location: Maidenhead.toLatLon(s.reporter_grid),
			callsign: s.reporter
		})))
		this.qth.update({locations: qth_locations})
		$('#callsign-submit').prop('disabled', false)
	}
}

export default App
