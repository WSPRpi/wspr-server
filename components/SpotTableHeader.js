import React from 'react'

class SpotTableHeader extends React.Component {
	render() {
		return (
<thead>
	<tr>
		<th>Time</th>
		<th>Callsign</th>
		<th>MHz</th>
		<th>Signal/Noise</th>
		<th>Drift</th>
		<th>Grid</th>
		<th>Power</th>
		<th>Reporter</th>
		<th>Reporter Grid</th>
		<th>Kilometres</th>
		<th>Azimuth</th>
	</tr>
</thead>
		)
	}
}

export default SpotTableHeader
