import React from 'react'
import Alert from 'react-bootstrap/lib/Alert'
import Grid from 'react-bootstrap/lib/Grid'
import Navbar from 'react-bootstrap/lib/Navbar'
import 'bootstrap/dist/css/bootstrap.css'

import AppTabs from './AppTabs'
import SpotSearch from './SpotSearch'

class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {spots: [], loading: false, activeTab: 1}
		this.callsigns = new Set([])

		this.handleSearch = this.handleSearch.bind(this)
		this.handleTab = this.handleTab.bind(this)
	}

	handleSearch(callsigns) {
		if(callsigns.length == 0) return

		this.callsigns = callsigns
		this.setState({loading: true});

                (async (ref) => {
                        let spots
                        try {   
				let query = '/spots/' + callsigns.join('+')
                                let response = await fetch(query)
                                let data = await response.json()
				spots = data.spots
                        } catch(e) {
                                console.error("failed to retrieve spots: " + e)
                        }
                        ref.setState({spots: spots, loading: false})
                })(this)
	}

	handleTab(activeTab) {
		this.setState({activeTab})
	}

	render() {
		let loading = this.state.loading
		let spots = this.state.spots

		return (
<div>
	<Navbar>
		<Navbar.Header>
			<Navbar.Brand>WSPR</Navbar.Brand>
		</Navbar.Header>
	</Navbar>
	{loading && <Alert bsStyle="info">Loading spot data...</Alert>}
	<SpotSearch handleSearch={this.handleSearch}/>
	<Grid fluid={true}>
		<AppTabs spots={spots}/>
	</Grid>
</div>
		)
	}
}

export default App
