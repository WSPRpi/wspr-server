import React from 'react'
import AppView from './AppView'

class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			spots: [],
			loading: true
		}
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
	}

	componentDidMount() {
		this.fetchData(this)
	}

	render() {
		let spots = this.state.spots
		let loading = this.state.loading
		return <AppView loading={loading} spots={spots}/>
	}
}

export default App
