import React from 'react'
import FormControl from 'react-bootstrap/lib/FormControl'

class SpotSearch extends React.Component {
	constructor(props) {
		super(props)
		this.state = {search: ''}

		this.handleSearchChange = this.handleSearchChange.bind(this)
	}

	handleSearchChange(e) {
		let search = e.target.value.trim().toUpperCase()
		this.setState({search: search})

		this.props.handleResults(this.props.spots.filter((spot) =>
			(spot.callsign == search) ||
			(spot.reporter == search)
		))
	}

	render() {
		return (
<FormControl
	type="text"
	value={this.state.search}
	placeholder="Search for a callsign..."
	onChange={this.handleSearchChange}
/>
		)
	}
}

export default SpotSearch
