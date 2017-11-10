class Bandhop {
	constructor(props) {
		this.getData = this.getData.bind(this)
		this.setData = this.setData.bind(this)
		this.redraw = this.redraw.bind(this)
		this.onclick = this.onclick.bind(this)
		let {widget, input} = props
		this.widget = widget
		this.widget.click(this.onclick)
		this.ctx = this.widget[0].getContext('2d')
		this.input = input

		this.width = 2400
		this.height = 1200
		this.size = 100
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
			'00',
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
			'160m',
			'80m',
			'60m',
			'40m',
			'30m',
			'20m',
			'17m',
			'15m',
			'12m',
			'10m',
			'6m',
			'2m'
		]
		this.band_colours = [
			'black',
			'brown',
			'red',
			'orange',
			'yellow',
			'green',
			'blue',
			'indigo',
			'violet',
			'gold',
			'silver',
			'white'
		]
		this.redraw()
	}

	getData() {return this.input.val().split(',').map(x => parseInt(x, 16))}
	setData(data) {
		this.input.val(data.map(x => x.toString(16)).join(','))
		this.input.trigger('change')
	}

	redraw() {
		let data = this.getData()
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.ctx.lineWidth = 10
		this.ctx.strokeStyle = '#cccccc'
		for(var i = 0; i < this.width; i += this.size) {
			this.ctx.beginPath()
			this.ctx.moveTo(i, 0)
			this.ctx.lineTo(i, this.height)
			this.ctx.stroke()
		}
		for(var j = 0; j < this.height; j += this.size) {
			this.ctx.beginPath()
			this.ctx.moveTo(0, j)
			this.ctx.lineTo(this.width, j)
			this.ctx.stroke()
		}
		for(var i = 0; i < data.length; i++) {
			this.ctx.fillStyle = this.band_colours[data[i]]
			this.ctx.fillRect(
				this.size * i,
				this.size * data[i],
				this.size,
				this.size
			)
		}
		this.ctx.stroke()
	}

	onclick(e) {
		let data = this.getData()
		let posX = this.widget.offset().left
		let posY = this.widget.offset().top
		let pixX = e.pageX - posX
		let pixY = e.pageY - posY
		let x = this.width * (pixX / this.widget[0].clientWidth)
		let y = this.height * (pixY / this.widget[0].clientHeight)
		let i = Math.floor(x / this.size)
		let j = Math.floor(y / this.size)
		data[i] = j
		this.setData(data)
		this.redraw()
	}
}

export default Bandhop
