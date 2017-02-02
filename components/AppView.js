import React from 'react'
import Alert from 'react-bootstrap/lib/Alert'
import Col from 'react-bootstrap/lib/Col'
import Navbar from 'react-bootstrap/lib/Navbar'

import AppTabs from './AppTabs'
import SpotSearch from './SpotSearch'

class AppView extends React.Component {
	constructor(props) {
		super(props)

		this.state = {results: []}
		this.handleSearch = this.handleSearch.bind(this)
	}

	handleSearch(results) {
		this.setState({results})
	}

	render() {
		let loading = this.props.loading
		let spots = this.props.spots
		let results = this.state.results

		return (
<div>
	<Navbar>
		<Navbar.Header>
			<Navbar.Brand>WSPR Spots</Navbar.Brand>
		</Navbar.Header>
	</Navbar>
	{loading && <Alert bsStyle="info">Loading spot data...</Alert>}
	<Col lg={2}>
		<SpotSearch
			handleResults={this.handleSearch}
			spots={spots}
		/>
	</Col>
	<Col lg={10}>
		<AppTabs spots={spots} results={results}/>
	</Col>
</div>
		)
	}
}

export default AppView
