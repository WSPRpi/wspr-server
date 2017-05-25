import React from 'react'
import Alert from 'react-bootstrap/lib/Alert'
import Grid from 'react-bootstrap/lib/Grid'
import Navbar from 'react-bootstrap/lib/Navbar'
import 'bootstrap/dist/css/bootstrap.css'

import AppTabs from './AppTabs'
import SpotSearch from './SpotSearch'

class AppView extends React.Component {
	constructor(props) {
		super(props)

		this.state = {results: [], activeTab: 1}
		this.handleSearch = this.handleSearch.bind(this)
		this.handleTab = this.handleTab.bind(this)
	}

	handleSearch(results) {
		this.setState({results})
	}

	handleTab(activeTab) {
		this.setState({activeTab})
	}

	render() {
		let loading = this.props.loading
		let spots = this.props.spots
		let results = this.state.results

		return (
<div>
	<Navbar>
		<Navbar.Header>
			<Navbar.Brand>WSPR</Navbar.Brand>
		</Navbar.Header>
	</Navbar>
	{loading && <Alert bsStyle="info">Loading spot data...</Alert>}
	<SpotSearch handleResults={this.handleSearch} spots={spots}/>
	<Grid fluid={true}>
		<AppTabs spots={spots} results={results}/>
	</Grid>
</div>
		)
	}
}

export default AppView
