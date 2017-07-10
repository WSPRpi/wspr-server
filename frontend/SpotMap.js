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

		this.update(this.spots)
	}

	redraw() {
		// 5-pixel bodge. So hang me.
		let width = $(window).width() - 5
		let height =
			$(window).height() -
			$(this.container).offset().top -
			5

		let map = d3.select(this.container)
			.attr('width', width + 'px')
			.attr('height', height + 'px')
			.style('background-color', 'white')
		map.selectAll('*').remove()

		let projection = azimuthal()
			.translate([width / 2, height / 2])
			.rotate([74, -40.7, 0])

		let path = d3.geoPath().projection(projection)
		let subunits = feature(
			this.world_data,
			this.world_data.objects.countries
		)
		map.append('circle')
			.attr('cx', width / 2)
			.attr('cy', height / 2)
			.attr('r', '250px')
			.attr('fill', '#2222aa')

		map.append('path')
			.datum(subunits)
			.attr('d', path)
			.style('fill', '#aaaa22')
			.style('stroke-width', '1px')
			.style('stroke', '#111')

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
