import SVG from 'svgjs'
import $ from 'jquery'

const band_reservation = 13
const hour_reservation = 10
const dx = (100 - band_reservation) / 24
const dy = (100 - hour_reservation) / 12

class Bandhop {
	constructor(props) {
		this.getBandhop = this.getBandhop.bind(this)
		this.setBandhop = this.setBandhop.bind(this)
		this.getTxDisable = this.getTxDisable.bind(this)
		this.setTxDisable = this.setTxDisable.bind(this)
		this.draw = this.draw.bind(this)
		this.redraw = this.redraw.bind(this)

		let {widget, bandhop, txdisable} = props
		this.svg = SVG(widget).size("100%", "280px")
		this.bandhop = bandhop
		this.txdisable = txdisable

		this.hours = [
			'00',
			'01',
			'02',
			'03',
			'04',
			'05',
			'06',
			'07',
			'08',
			'09',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'17',
			'18',
			'19',
			'20',
			'21',
			'22',
			'23'
		]
		this.bands = [
			'2200m',
			'630m',
			'160m',
			'80m',
			'60m',
			'40m',
			'30m',
			'20m',
			'17m',
			'15m',
			'12m',
			'10m'
		]

		this.tx_lights = []
		this.markers = []
		this.draw()
	}

	draw() {
		// axes
		for(var i = 0; i < 24; i++) {
			this.svg.text(this.hours[i]).move(
				`${band_reservation + i * (100 - band_reservation) / 24}%`,
				`${100 - hour_reservation}%`
			)
		}

		for(var j = 0; j < 12; j++) {
			let y = j * dy

			this.svg.text(this.bands[j]).move(
				`5%`,
				`${y}%`,
			)

			// TX lights
			let tx = this.svg.text('TX').move(
				'0%',
				`${y}%`
			).attr({
				fill: 'white'
			})
			$(tx.node).css({
				cursor: 'pointer'
			})
			let band = j
			tx.click(() => {
				let txdisable = this.getTxDisable()
				txdisable[band] = 1 - txdisable[band]
				this.setTxDisable(txdisable)
			})

			let txbox = tx.bbox()
			let light = this.svg.rect(txbox.w, txbox.h).move(
				txbox.x,
				txbox.y
			).attr({
				fill: 'black',
				rx: '1%',
				ry: '1%'
			}).back()
			this.tx_lights.push(light)
		}

		for(var i = 0; i < 24; i++) {
			let x = band_reservation + i * dx + dx / 2

			// blops
			this.svg.line(
				`${x}%`,
				`${dy / 2 + 2}%`,
				`${x}%`,
				`${100 - hour_reservation - 2}%`
			).stroke({width: '0.5%'}).attr({
				stroke: '#ccc'
			})

			for(var j = 0; j < 12; j++) {
				let y = j * dy + dy / 2
				let circle = this.svg.circle('2.5%').attr({
					fill: '#ccc'
				}).center(
					`${x}%`,
					`${y + 2}%`
				)
				$(circle.node).css({
					cursor: 'pointer'
				})

				let hour = i
				let band = j
				circle.click(() => {
					let bandhop = this.getBandhop()
					bandhop[hour] = band
					this.setBandhop(bandhop)
				})
			}

			// markers
			let marker = this.svg.circle('3.5%').attr({
				fill: '#337ab7'
			}).center(
				`${x}%`,
				`50%`
			)
			this.markers.push(marker)
		}
	}

	redraw() {
		let bandhop = this.getBandhop()
		let txdisable = this.getTxDisable()

		// move markers
		for(var i = 0; i < 24; i++) {
			let x = band_reservation + i * dx + dx / 2
			let y = bandhop[i] * dy + dy / 2 + 2
			this.markers[i].animate({
				ease: '<>',
				duration: '0.3s'
			}).center(
				`${x}%`,
				`${y}%`
			)
		}

		// enable TX lights
		for(var j = 0; j < 12; j++) {
			let enabled = txdisable[j] == '0'
			this.tx_lights[j].attr({
				fill: enabled ? 'green' : 'red'
			})
		}
	}

	getBandhop() {
		return this.bandhop.val().split(',').map(x => parseInt(x, 16))
	}

	getTxDisable() {
		return this.txdisable.val().split(',').map(x => parseInt(x, 2))
	}

	setBandhop(bandhop) {
		bandhop = bandhop.map(x => x.toString(16)).join(',')
		this.bandhop.val(bandhop)
		this.bandhop.trigger('change')
		this.redraw()
	}

	setTxDisable(txdisable) {
		txdisable = txdisable.map(x => x.toString(16)).join(',')
		this.txdisable.val(txdisable)
		this.txdisable.trigger('change')
		this.redraw()
	}
}

export default Bandhop
