import * as d3 from 'd3'
import {feature} from 'topojson'
import {geoAzimuthalEquidistant as azimuthal} from 'd3-geo'
import $ from 'jquery'

const SEA_COLOR_FOR_DAN_DERP = 'blue'
const LAND_COLOR_FOR_DAN_DERP = 'green'
const LINE_COLOR_FOR_DAN_DERP = 'black'
const BACKGROUND_COLOR_FOR_DAN_DERP = 'white'

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
			.style('background-color', BACKGROUND_COLOR_FOR_DAN_DERP)
			.call(d3.zoom()
				.scaleExtent([0.5, 20])
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
		this.map.append('circle')
			.attr('r', `${500 * this.transform.k}px`)
			.attr("transform", this.transform)
			.style('fill', SEA_COLOR_FOR_DAN_DERP)

		this.map.append('path')
			.datum(subunits)
			.attr('d', path)
			.attr('id', 'countries')
			.style('fill', LAND_COLOR_FOR_DAN_DERP)
			.style('stroke', LINE_COLOR_FOR_DAN_DERP)
	}

	drawSpots() {
		this.map.selectAll('.spot-paths').remove()

		let data = this.spots.map(spot => ({
			type: 'LineString',
			coordinates: [spot.from_location, spot.to_location],
			from: spot.from,
			to: spot.to
		}))

		let randomHue = () => Math.floor(Math.random() * 360)
		let path = d3.geoPath().projection(this.projection)

		let self = this
		function handleMouseOver() {
			d3.select(this).style('stroke-width', `${5 / self.transform.k}px`)
		}

		function handleMouseOut() {
			d3.select(this).style('stroke-width', `${1 / self.transform.k}px`)
		}

		let spots = this.map.selectAll('path')
			.data(data)
			.enter()
			.append('path')
			.attr('d', path)
			.attr('class', 'spot-paths')
			.style('fill', 'none')
			.style('stroke', () => d3.hsl(randomHue(), 1, 0.5))
			.on('mouseover', handleMouseOver)
			.on('mouseout', handleMouseOut)
		spots.append('svg:title')
			.text(s => `${s.to} reporting ${s.from}`)
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
