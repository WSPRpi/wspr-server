import SpotSearch from './SpotSearch'
import SpotTable from './SpotTable'
import SpotMap from './SpotMap'
import QTHMap from './QTHMap'

import Maidenhead from 'maidenhead'
import $ from 'jquery'
import HashRouter from 'hash-router'

function latlonAverage(spots) {
	let lat = spots.reduce(
		(a, s) => a + s.from_location[0] + s.to_location[0],
		0
	) / (2 * spots.length)
	let lon = spots.reduce(
		(a, s) => a + s.from_location[1] + s.to_location[1],
		0
	) / (2 * spots.length)
	return [lat, lon]
}

class App {
	constructor() {
		this.fetchData = this.fetchData.bind(this)
		this.update = this.update.bind(this)
		this.spots = []

		this.search = new SpotSearch({
			select: $('#callsign-select'),
			onUpdate: callsigns => this.fetchData(callsigns)
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

		let router = HashRouter()
		router.addRoute("#/", routeTable)
		router.addRoute("#/table", routeTable)
		router.addRoute("#/spot-map", routeSpotMap)
		router.addRoute("#/qth-map", routeQTHMap)
		window.addEventListener("hashchange", router)
		router()
	}

	fetchData(callsigns) {
		if(callsigns.length == 0) {
			this.spots = []
			this.update()
			return
		}

		(async (ref) => {
                        try {
				let headers = {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}

                                let response = await fetch('/spots', {
					headers: headers,
					method: 'POST',
					body: JSON.stringify({callsigns})
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
		let table_data = this.spots
		this.table.update(table_data)

		let map_data = this.spots.map(s => ({
			from_location: Maidenhead.toLatLon(s.grid).reverse(),
			to_location: Maidenhead.toLatLon(s.reporter_grid).reverse(),
			from: s.callsign,
			to: s.reporter
		}))
		let map_centre = latlonAverage(map_data)
		this.map.update(map_data, map_centre)

		let qth_data = this.spots.map(s => ({
			location: Maidenhead.toLatLon(s.grid),
			callsign: s.callsign
		})).concat(this.spots.map(s => ({
			location: Maidenhead.toLatLon(s.reporter_grid),
			callsign: s.reporter
		})))
		this.qth.update(qth_data)
	}
}

export default App
