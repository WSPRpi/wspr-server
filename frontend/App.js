import SpotSearch from './SpotSearch'
import SpotTable from './SpotTable'
import SpotMap from './SpotMap'

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
				this.update()
                        } catch(e) {
                                console.error("failed to retrieve spots: " + e)
                        }
		})(this)
	}

	update() {
		this.table.update(this.spots)
		this.map.update(this.spots)
	}
}

export default App
