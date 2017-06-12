import React from 'react'
import SpotTableEntry from './SpotTableEntry'

class SpotTableBody extends React.Component {
	render() {
		let entries = this.props.spots.map((spot, key) =>
<SpotTableEntry spot={spot} key={key}/>
		)

		return (
<tbody>
	{entries}
</tbody>
		)
	}
}

export default SpotTableBody
