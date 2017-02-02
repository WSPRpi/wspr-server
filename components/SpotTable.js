import React from 'react'
import Table from 'react-bootstrap/lib/Table'
import SpotTableHeader from './SpotTableHeader'
import SpotTableBody from './SpotTableBody'

class SpotTable extends React.Component {
	render() {
		let results = this.props.results
		return (
<Table striped condensed>
	<SpotTableHeader/>	
	<SpotTableBody results={results}/>
</Table>
		)
	}
}

export default SpotTable
