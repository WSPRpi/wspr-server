import React from 'react'
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import SpotTable from './SpotTable'
import SpotTableSearch from './SpotTableSearch'

class SpotTablePane extends React.Component {
	constructor(props) {
		super(props)

		this.state = {results: []}
		this.handleResults = this.handleResults.bind(this)
	}

	handleResults(results) {
		this.setState({results: results})
	}

	render() {
		let spots = this.props.spots
		let results = this.state.results

		return (
<div>
	<Col lg={2}>
		<SpotTableSearch
			handleResults={this.handleResults}
			spots={spots}
		/>
	</Col>
	<Col lg={10}><SpotTable spots={results}/></Col>
</div>
		)
	}
}

export default SpotTablePane
