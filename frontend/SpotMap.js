import * as d3 from 'd3'
import {feature} from 'topojson'
import {geoAzimuthalEquidistant as azimuthal} from 'd3-geo'
import Maidenhead from 'maidenhead'
import $ from 'jquery'

class SpotMap {
	constructor(props) {
		this.redraw = this.redraw.bind(this)
		this.update = this.update.bind(this)

		this.container = props.map
		this.world_data = require('./world.geo.json')
		this.spots = []

		this.redraw()
	}

	redraw() {
		let height = $(window).height() - $(this.container).offset().top

		let map = d3.select(this.container)
			.attr('width', '100%')
			.attr('height', height + 'px')
			.style('background-color', '#eee')
		map.selectAll('*').remove()

		let projection = azimuthal()
			.scale(150)
			.translate([width / 2, height / 2])

		let path = d3.geoPath().projection(projection)
		let subunits = feature(
			this.world_data,
			this.world_data.objects.countries
		)
		map.append('path')
			.datum(subunits)
			.attr('d', path)
			.style('fill', 'grey')
			.style('stroke', '#eee')

		this.spots.forEach(spot => {
			let [lat, lon] = Maidenhead.toLatLon(spot.reporter_grid)
			let [cx, cy] = projection([lon, lat])
			map.append('circle')
				.attr('cx', cx)
				.attr('cy', cy)
				.attr('r', '5px')
		})
	}

	update(spots) {
		this.spots = spots
		this.redraw()
	}
}

export default SpotMap
