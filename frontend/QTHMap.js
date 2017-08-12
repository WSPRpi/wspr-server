import {map, marker, TileLayer, Icon} from 'leaflet'
import $ from 'jquery'

class QTHMap {
	constructor(props) {
		this.draw = this.draw.bind(this)
		this.update = this.update.bind(this)
		this.markers = []
		this.locations = []

		this.container = props.map
		this.map = map(this.container.slice(1))
			.setView([0, 0], 1)
			.addLayer(
				new TileLayer(
					'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					{attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'}
				)
			)

		this.draw()
	}

	draw() {
		let unique = {}
		this.locations.forEach(d => {
			let location = d.location
			let callsign = d.callsign
			let key = String(location)
			if(!(key in unique))
				unique[key] = {location, callsigns: {}}
			unique[key].callsigns[callsign] = true
		})
		// fix Leaflet being dense about icon paths
		let icon = new Icon(Object.assign(
			Icon.Default.prototype.options,
			{
				iconUrl: require('leaflet/dist/images/marker-icon.png'),
				shadowUrl: require('leaflet/dist/images/marker-shadow.png')
			}
		));
		let format = (callsigns) => Object.keys(callsigns).join(', ')
		this.markers.forEach(m => this.map.removeLayer(m))
		this.markers = Object.keys(unique).map(k => 
			marker(unique[k].location, {icon: icon})
				.bindPopup(format(unique[k].callsigns))
				.addTo(this.map)
		)
		this.map.invalidateSize()
	}

	update(data) {
		let {locations} = data
		this.locations = locations
		this.draw()
	}
}

export default QTHMap
