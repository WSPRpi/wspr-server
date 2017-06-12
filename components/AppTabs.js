import React from 'react'
import Tab from 'react-bootstrap/lib/Tab'
import Tabs from 'react-bootstrap/lib/Tabs'

import SpotTablePane from './SpotTablePane'
import SpotMap from './SpotMap'

class AppTabs extends React.Component {
	render() {
		let spots = this.props.spots

		return (
<Tabs id="application-tabs">
	<Tab eventKey={1} title="Spots">
		<SpotTablePane spots={spots}/>
	</Tab>
	<Tab eventKey={2} title="Map" onEntering={() => this.map.redraw()}>
		<SpotMap spots={spots} ref={map => this.map = map}/>
	</Tab>
</Tabs>
		)
	}
}

export default AppTabs
