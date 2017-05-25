import React from 'react'
import FormControl from 'react-bootstrap/lib/FormControl'
import FormGroup from 'react-bootstrap/lib/FormGroup'

class SpotSearch extends React.Component {
	constructor(props) {
		super(props)
		this.state = {search: ''}

		this.handleSearchChange = this.handleSearchChange.bind(this)
	}

	handleSearchChange(e) {
		let search = e.target.value.trim().toUpperCase()
		this.setState({search: search})

		let results = this.props.spots.filter(spot =>
			(spot.callsign == search) ||
			(spot.reporter == search)
		).map(result => Object.assign({}, result, {
			us: result.reporter == search
		}));
		this.props.handleResults(results);
	}

	render() {
		return (
<FormGroup>
	<FormControl
		type="text"
		value={this.state.search}
		placeholder="Search for a callsign..."
		onChange={this.handleSearchChange}
	/>
</FormGroup>
		)
	}
}

export default SpotSearch
