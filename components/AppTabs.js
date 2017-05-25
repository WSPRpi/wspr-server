import React from 'react'
import Tab from 'react-bootstrap/lib/Tab'
import Tabs from 'react-bootstrap/lib/Tabs'

import SpotTablePane from './SpotTablePane'
import SpotMap from './SpotMap'

class AppTabs extends React.Component {
	render() {
		let loading = this.props.loading
		let spots = this.props.spots
		let results = this.props.results

		return (
<Tabs id="application-tabs">
	<Tab eventKey={1} title="Spots">
		<SpotTablePane results={results}/>
	</Tab>
	<Tab eventKey={2} title="Map" onEntering={() => this.map.redraw()}>
		<SpotMap results={results} ref={map => this.map = map}/>
	</Tab>
</Tabs>
		)
	}
}

export default AppTabs
