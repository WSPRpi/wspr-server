class SpotSearch {
	constructor(props) {
		let {input1, input2, nickname, form, onUpdate} = props

		input1.on('input', e => {
			let call = input1.val().trim().toUpperCase()
			switch(String(call) /* massive JS bullshit */) {
			case 'M1GEO':
				console.warn("F4NTA DETECTED")
				nickname.html('<span style="color: orange">George "Fanta" Smart!</span>')
				break
			case 'G3ZAY':
				nickname.html('<a href="https://www.youtube.com/watch?v=iuI_iPiWVlc">G3ZAY at his best</a>')
				break
			default:
				nickname.text('')
				break
			}
		})

		form.on('submit', e => {
			input1.blur()
			input2.blur()

			let callsign1 = input1.val().trim().toUpperCase()
			let callsign2 = input2.val().trim().toUpperCase()
			onUpdate(callsign1, callsign2)
			e.preventDefault()
		})
	}
}

export default SpotSearch
