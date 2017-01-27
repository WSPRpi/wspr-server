import React from 'react'
import format from 'date-format'

class SpotTableEntry extends React.Component {
	render() {
		const renderTimestamp = ((time) => format.asString(
			'hh:mm dd/MM/yy',
			new Date(1000 * time)
		))
		let spot = this.props.spot
		return (
<tr>
	<td>{renderTimestamp(spot.timestamp)}</td>
	<td>{spot.callsign}</td>
	<td>{spot.mhz}</td>
	<td>{spot.snr}</td>
	<td>{spot.drift}</td>
	<td>{spot.grid}</td>
	<td>{spot.power}</td>
	<td>{spot.reporter}</td>
	<td>{spot.reporter_grid}</td>
	<td>{spot.km}</td>
	<td>{spot.az}</td>
</tr>
		)
	}
}

export default SpotTableEntry
