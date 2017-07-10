import moment from 'moment'

class SpotTable {
	constructor(props) {
		this.update = this.update.bind(this)

		let {table} = props
		this.table = table
	}

	update(spots) {
		let renderTime = (time => moment
			.unix(time)
			.utc()
			.format('YYYY-MM-DD hh:mm')
		)

		let html = spots
			.map(spot => (
				"<tr>" +
				"<td>" + renderTime(spot.timestamp) + "</td>" +
				"<td>" + spot.callsign + "</td>" +
				"<td>" + spot.mhz + "</td>" +
				"<td>" + spot.snr + "</td>" +
				"<td>" + spot.drift + "</td>" +
				"<td>" + spot.grid + "</td>" +
				"<td>" + spot.power + "</td>" +
				"<td>" + spot.reporter + "</td>" +
				"<td>" + spot.reporter_grid + "</td>" +
				"<td>" + spot.km + "</td>" +
				"<td>" + spot.az + "</td>" +
				"</tr>"
			))
			.join('')
		this.table.html(html)
	}
}

export default SpotTable
