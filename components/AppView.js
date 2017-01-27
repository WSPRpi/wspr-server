import React from 'react'
import Alert from 'react-bootstrap/lib/Alert'
import Navbar from 'react-bootstrap/lib/Navbar'
import Tab from 'react-bootstrap/lib/Tab'
import Tabs from 'react-bootstrap/lib/Tabs'
import SpotTablePane from './SpotTablePane'

class AppView extends React.Component {
	render() {
		let loading = this.props.loading
		let spots = this.props.spots
		return (
<div>
	<Navbar>
		<Navbar.Header>
			<Navbar.Brand>WSPR Spots</Navbar.Brand>
		</Navbar.Header>
	</Navbar>
	{loading && <Alert bsStyle="info">Loading spot data...</Alert>}
	<Tabs id="application-tabs">
		<Tab eventKey={1} title="Spots">
			<SpotTablePane spots={spots}/>
		</Tab>
	</Tabs>
</div>
		)
	}
}

export default AppView
