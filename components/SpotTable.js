import React from 'react'
import Table from 'react-bootstrap/lib/Table'
import SpotTableHeader from './SpotTableHeader'
import SpotTableBody from './SpotTableBody'

class SpotTable extends React.Component {
	render() {
		let spots = this.props.spots
		return (
<Table>
	<SpotTableHeader/>	
	<SpotTableBody spots={spots}/>
</Table>
		)
	}
}

export default SpotTable
