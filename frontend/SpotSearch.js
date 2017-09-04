class SpotSearch {
	constructor(props) {
		let {input1, input2, inputWhen, form, onUpdate} = props

		form.on('submit', e => {
			input1.blur()
			input2.blur()

			let callsign1 = input1.val().trim().toUpperCase()
			let callsign2 = input2.val().trim().toUpperCase()
			let when = inputWhen.val()
			onUpdate(callsign1, callsign2, when)
			e.preventDefault()
		})
	}
}

export default SpotSearch
