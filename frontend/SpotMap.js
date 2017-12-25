import * as d3 from 'd3'
import {feature} from 'topojson'
import {geoAzimuthalEquidistant as azimuthal} from 'd3-geo'
import $ from 'jquery'

const SEA_COLOR_FOR_DAN_DERP = '#6495ED'
const LAND_COLOR_FOR_DAN_DERP = 'green'
const LINE_COLOR_FOR_DAN_DERP = 'black'
const BACKGROUND_COLOR_FOR_DAN_DERP = 'white'
const CALLSIGN1_COLOR_FOR_DAN_DERP = 'red'
const CALLSIGN2_COLOR_FOR_DAN_DERP = 'yellow'
const CALLSIGN_BOTH_COLOR_FOR_DAN_DERP = 'purple'

function d3ify_coord(c) {
	return c.slice().reverse()
}

class SpotMap {
	constructor(props) {
		this.drawMap = this.drawMap.bind(this)
		this.drawSpots = this.drawSpots.bind(this)
		this.setZoom = this.setZoom.bind(this)
		this.draw = this.draw.bind(this)
		this.onZoom = this.onZoom.bind(this)
		this.update = this.update.bind(this)

		this.container = props.map
		this.callsign1 = null
		this.callsign2 = null
		this.spot_data = []
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
	}

	drawMap() {
		let world_data = require('./world.geo.json')

		let path = d3.geoPath().projection(this.projection)
		let subunits = feature(
			world_data,
			world_data.objects.countries
		)

		let centre = this.projection(this.centre)
		let background = this.map.append('path')
			.datum({type: 'Sphere'})
			.attr('class', 'map-sea')
			.attr('d', path)
			.style('fill', SEA_COLOR_FOR_DAN_DERP)
			
		let globe = this.map.append('path')
			.datum(subunits)
			.attr('d', path)
			.attr('class', 'map-land')
			.style('fill', LAND_COLOR_FOR_DAN_DERP)
			.style('stroke', LINE_COLOR_FOR_DAN_DERP)

		// backpatch background size
		let bbox = globe.node().getBBox()
		let radius = Math.max(bbox.width, bbox.height) / 2
		background.attr('r', `${radius}px`)
	}

	drawSpots() {
		let unique = {}
		this.spot_data.forEach(spot => {
			let from = spot.from
			let to = spot.to
			let from_c = d3ify_coord(spot.from_location)
			let to_c = d3ify_coord(spot.to_location)
			let key = `${from}->${to},${to}->${from}`
			let isCallsign1 =
				from == this.callsign1 || to == this.callsign1
			let isCallsign2 =
				from == this.callsign2 || to == this.callsign2


			if(key in unique) {
				unique[key].isCallsign1 =
					unique[key].isCallsign1 || isCallsign1
				unique[key].isCallsign2 =
					unique[key].isCallsign2 || isCallsign2
			}
			else {
				unique[key] = {
					coordinates: [from_c, to_c],
					from,
					to,
					isCallsign1,
					isCallsign2
				}
			}
		})
		let data = Object.values(unique).map(spot => Object.assign({
			type: 'LineString'
		}, spot))

		let path = d3.geoPath().projection(this.projection)
		let self = this
		function handleMouseOver() {
			d3.select(this).style('stroke-width', `${5 / self.transform.k}px`)
		}
		function handleMouseOut() {
			d3.select(this).style('stroke-width', `${1 / self.transform.k}px`)
		}
		let color = (d) => (!d.isCallsign1 ?
			CALLSIGN2_COLOR_FOR_DAN_DERP :
			!d.isCallsign2 ?
				CALLSIGN1_COLOR_FOR_DAN_DERP :
				CALLSIGN_BOTH_COLOR_FOR_DAN_DERP)

		let spots = this.map.selectAll('.map-spots')
			.data(data)
			.enter()
			.append('path')
			.attr('d', path)
			.attr('class', 'map-spots')
			.style('fill', 'none')
			.style('stroke', (d, i) => color(d))
			.on('mouseover', handleMouseOver)
			.on('mouseout', handleMouseOut)
		spots.append('svg:title')
			.text(s => `${s.to} reporting ${s.from}`)
	}

	setZoom() {
		this.map.selectAll('.map-sea')
			.attr('transform', this.transform)
		this.map.selectAll('.map-land')
			.attr('transform', this.transform)
			.style(
				'stroke-width',
				`${1 / this.transform.k}px`
			)
		this.map.selectAll('.map-spots')
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

		this.map.selectAll('.map-spots').remove()
		this.map.selectAll('.map-land').remove()
		this.map.selectAll('.map-sea').remove()
		this.drawMap()
		this.drawSpots()
		this.setZoom()
	}

	onZoom() {
		this.transform = d3.event.transform
		this.setZoom()
	}

	update(data) {
		let {spots, callsign1, callsign2} = data
		this.callsign1 = callsign1
		this.callsign2 = callsign2
		this.spot_data = spots
		spots.forEach(spot => {
			if(spot.from == this.callsign1)
				this.centre = d3ify_coord(spot.from_location)
			if(spot.to == this.callsign1)
				this.centre = d3ify_coord(spot.to_location)
		})
		this.projection = d3.zoomIdentity
		this.draw()
	}
}

export default SpotMap
