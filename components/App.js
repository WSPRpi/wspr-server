import React from 'react'
import AppBar from 'material-ui/AppBar'
import SpotTable from './SpotTable'

const FETCH_DELAY = 300000
class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			spots: [],
			loading: true
		}
		this.timer = null
	}

	fetchData(ref) {
		(async () => {
			try {
				this.setState({loading: true})
				let response = await fetch('/spots')
				let spots = await response.json()
				ref.setState(spots)
				ref.setState({loading: false})
				console.log("fetched data")
			} catch(e) {
				console.error("failed to retrieve spots: " + e)
			}
		})()
		this.timer = setInterval(() => this.fetchData(ref), FETCH_DELAY)
	}

	componentDidMount() {
		this.fetchData(this)
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	render() {
		let spots = this.state.spots
		return (
<div>
	<AppBar title="WSPR Spots"/>
	<SpotTable spots={spots}/>
</div>
		)
	}
}

export default App
