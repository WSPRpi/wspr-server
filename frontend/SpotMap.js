import * as d3 from 'd3'
import {feature} from 'topojson'
import {geoAzimuthalEquidistant as azimuthal} from 'd3-geo'
import $ from 'jquery'

class SpotMap {
	constructor(props) {
		this.redraw = this.redraw.bind(this)
		this.update = this.update.bind(this)
		this.zoom = this.zoom.bind(this)

		this.container = props.map
		this.world_data = require('./world.geo.json')
		this.spots = []

		this.map = d3.select(this.container)
			.style('background-color', '#aaa')
			.style('pointer-events', 'all')
			.call(
				d3.zoom()
					.scaleExtent([1/2, 50])
					.on("zoom", this.zoom)
			)

		let width = $(window).width()
		let height = $(window).height() - $(this.container).offset().top
		let centre = this.spots.map(
		this.projection = azimuthal()
			.translate([width / 2, height / 2])
			.rotate([74, -40.7, 0])

		let path = d3.geoPath().projection(this.projection)
		let subunits = feature(
			this.world_data,
			this.world_data.objects.countries
		)

		this.map.append('path')
			.datum(subunits)
			.attr('d', path)
			.attr('id', 'countries')
			.style('fill', '#eee')
			.style('stroke', '#111')
	}

	redraw() {
		let width = $(window).width()
		let height = $(window).height() - $(this.container).offset().top
		this.map
			.attr('width', width + 'px')
			.attr('height', height + 'px')

		this.map.selectAll('.spot-paths').remove()

		this.spots.forEach(spot => {
			let p1 = spot.from_location
			let p2 = spot.to_location
			let path = d3.geoPath(this.projection)

			this.map.append('path')
				.datum({
					type: 'LineString',
					coordinates: [p1, p2]
				})
				.attr('d', path)
				.attr('class', 'spot-paths')
				.style('fill', 'none')
				.style('stroke', 'red')
		})

		this.map.attr("transform", this.transform)
		this.map.select('#countries').style(
			'stroke-width',
			`${1 / this.transform.k}px`
		)
		this.map.selectAll('.spot-paths').style(
			'stroke-width',
			`${1 / this.transform.k}px`
		)
	}

	update(spots) {
		this.spots = spots
		this.redraw()
	}

	zoom() {
		this.transform= d3.event.transform
		this.redraw()
	}
}

export default SpotMap
