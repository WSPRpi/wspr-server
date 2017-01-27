import React from 'react'
import Navbar from 'react-bootstrap/lib/Navbar'
import SpotTable from './SpotTable'

class AppView extends React.Component {
	render() {
		let spots = this.props.spots
		return (
<div>
	<Navbar>
		<Navbar.Header>
			<Navbar.Brand>WSPR Spots</Navbar.Brand>
		</Navbar.Header>
	</Navbar>
	<SpotTable spots={spots}/>
</div>
		)
	}
}

export default AppView
