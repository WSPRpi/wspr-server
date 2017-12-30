import SpotSearch from './SpotSearch'
import SpotTable from './SpotTable'
import SpotMap from './SpotMap'
import QTHMap from './QTHMap'
import Configuration from './Configuration'
import Bandhop from './Bandhop'

import Maidenhead from 'maidenhead'
import $ from 'jquery'
import HashRouter from 'hash-router'

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
			version: $('#config-version'),
			status: $('#config-status'),
			hostname: $('#config-hostname'),
			ip: $('#config-ip'),
			form: $('#config-form'),
			submit: $('#config-submit'),
			bandhopper: this.bandhopper,
			callsign: $('#callsign-input1'),
			upgrade_software: $('#upgrade-software'),
			upgrade_firmware: $('#upgrade-software'),
			upgrade_dialog: $('#upgrade-dialog'),
			upgrade_log: $('#upgrade-log')
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

	fetchData(callsign1, callsign2) {
		$('#callsign-submit').prop('disabled', true)
		this.callsign1 = callsign1
		this.callsign2 = callsign2
		var endpoint = '/spots?' + $.param({
			callsign1,
			callsign2
		});

		(async (ref) => {
                        try {
				let headers = {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
                                let response = await fetch(endpoint, {
					headers: headers,
					method: 'GET'
				})
                                let data = await response.json()
				this.spots = data.spots
                        } catch(e) {
                                console.error("failed to retrieve spots: " + e)
                        }
			finally {
				this.update()
			}
		})(this)
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
