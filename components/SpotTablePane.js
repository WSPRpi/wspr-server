import React from 'react'
import SpotTable from './SpotTable'

class SpotTablePane extends React.Component {
	render() {
		return (
<SpotTable spots={this.props.spots}/>
		)
	}
}

export default SpotTablePane
