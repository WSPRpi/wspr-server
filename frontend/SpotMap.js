import * as d3 from 'd3'
import {feature} from 'topojson'
import {geoAzimuthalEquidistant as azimuthal} from 'd3-geo'
import $ from 'jquery'

class SpotMap {
	constructor(props) {
		this.drawMap = this.drawMap.bind(this)
		this.drawSpots = this.drawSpots.bind(this)
		this.drawZoom = this.drawZoom.bind(this)
		this.draw = this.draw.bind(this)
		this.onZoom = this.onZoom.bind(this)
		this.update = this.update.bind(this)

		this.container = props.map
		this.spots = []
		this.centre = [0, 0]
		this.transform = d3.zoomIdentity
		this.projection = null

		this.map = d3.select(this.container)
			.style('background-color', '#aaa')
			.call(d3.zoom()
				.on("zoom", this.onZoom)
			)

		this.draw()
		window.addEventListener("resize", this.draw)

		this.drawMap()
	}

	drawMap() {
		let world_data = require('./world.geo.json')

		let path = d3.geoPath().projection(this.projection)
		let subunits = feature(
			world_data,
			world_data.objects.countries
		)

		this.map.select('#countries').remove()
		this.map.append('path')
			.datum(subunits)
			.attr('d', path)
			.attr('id', 'countries')
			.style('fill', '#eee')
			.style('stroke', '#111')
	}

	drawSpots() {
		this.map.selectAll('.spot-paths').remove()

		let data = this.spots.map(spot => ({
			type: 'LineString',
			coordinates: [spot.from_location, spot.to_location]
		}))

		let randomHue = () => Math.floor(Math.random() * 360)
		var path = d3.geoPath().projection(this.projection)
		this.map.selectAll('path')
			.data(data)
			.enter()
			.append('path')
			.attr('d', path)
			.attr('class', 'spot-paths')
			.style('fill', 'none')
			.style('stroke', () => d3.hsl(randomHue(), 1, 0.5))
	}

	drawZoom() {
		this.map.selectAll('path')
			.attr('transform', this.transform)
			.style(
				'stroke-width',
				`${1 / this.transform.k}px`
			)
	}

	draw() {
		let width = $(this.container).width()
		let height = $(this.container).height()
		this.projection = azimuthal()
			.translate([
				width / 2,
				height / 2
			])
			.rotate([-this.centre[0], -this.centre[1], 0])
			.scale(Math.min(width, height) / (2 * Math.PI))

		this.drawMap()
		this.drawSpots()
		this.drawZoom()
	}

	onZoom() {
		this.transform = d3.event.transform
		this.drawZoom()
	}

	update(spots, centre) {
		this.spots = spots
		this.centre = centre
		this.projection = d3.zoomIdentity
		this.draw()
	}
}

export default SpotMap
