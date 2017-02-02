import React from 'react'
import SpotTable from './SpotTable'

class SpotTablePane extends React.Component {
	render() {
		let results = this.props.results

		return (
<SpotTable results={results}/>
		)
	}
}

export default SpotTablePane
