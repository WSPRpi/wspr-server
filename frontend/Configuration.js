class Configuration {
	constructor(props) {
		this.handleMessage = this.handleMessage.bind(this)
		let {} = props

		this.socket = new WebSocket(`ws://${location.host}/config`)
		this.socket.onmessage = this.handleMessage
	}

	handleMessage(event) {
		console.log(event.data)
	}
}

export default Configuration
