import SpotSearch from './SpotSearch'
import SpotTable from './SpotTable'
import SpotMap from './SpotMap'
import QTHMap from './QTHMap'

import Maidenhead from 'maidenhead'
import $ from 'jquery'

class App {
	constructor() {
		this.fetchData = this.fetchData.bind(this)
		this.update = this.update.bind(this)

		this.callsigns = []
		this.spots = []

		this.search = new SpotSearch({
			select: $('#callsign-select'),
			onUpdate: callsigns => {
				this.callsigns = callsigns
				this.fetchData()
			}
		})

		this.table = new SpotTable({
			table: $('#spot-table')
		})

		this.map = new SpotMap({
			map: '#spot-map'
		})

		this.qth = new QTHMap({
			map: '#qth-map'
		})

		$('#spot-map-link').on('shown.bs.tab', e =>
		{
			this.map.redraw()
		})
		$('#qth-map-link').on('shown.bs.tab', e =>
		{
			this.qth.redraw()
		})

		this.update()
	}

	fetchData() {
		if(this.callsigns.length == 0) {
			this.spots = []
			this.update()
			return
		}

		(async (ref) => {
			let spots
                        try {
				let callsigns = this.callsigns.join('+')
				let headers = {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}

                                let response = await fetch('/spots', {
					headers: headers,
					method: 'POST',
					body: JSON.stringify({
						callsigns: this.callsigns
					})
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
		this.table.update(this.spots)

		let map_data = this.spots.map(s => ({
			from_location: Maidenhead.toLatLon(s.grid).reverse(),
			to_location: Maidenhead.toLatLon(s.reporter_grid).reverse()
		}))
		this.map.update(map_data)

		let qth_data = Array.concat(this.spots.map(s => ({
			location: Maidenhead.toLatLon(s.grid),
			callsign: s.callsign
		})), this.spots.map(s => ({
			location: Maidenhead.toLatLon(s.reporter_grid),
			callsign: s.reporter
		})))
		this.qth.update(qth_data)
	}
}

export default App
