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
		// fix Leaflet being dense about icon paths
		let icon = new Icon(Object.assign(
			Icon.Default.prototype.options,
			{
				iconUrl: require('leaflet/dist/images/marker-icon.png'),
				shadowUrl: require('leaflet/dist/images/marker-shadow.png')
			}
		));
		this.markers.forEach(m => this.map.removeLayer(m))
		this.markers = this.locations.map(l =>
			marker(l.location, {icon: icon})
			.bindPopup(l.callsign)
			.addTo(this.map)
		)
		this.map.invalidateSize()
	}

	update(locations) {
		this.locations = locations
		this.draw()
	}
}

export default QTHMap
