class SpotSearch {
	constructor(props) {
		let {input1, input2, nickname, form, extra_button, extra_dialog, extra_form, onUpdate} = props

		extra_button.click(() => {
			extra_dialog.modal()
		})
		extra_form.submit(e => {
			extra_dialog.modal('hide')
			e.preventDefault()
		})

		input1.on('input', e => {
			let call = input1.val().trim().toUpperCase()
			switch(String(call) /* massive JS bullshit */) {
			case 'M0VFC':
				nickname.html('<code>titanic.jpg</code> loaded...')
				break
			case 'M1GEO':
				console.warn("F4NTA DETECTED")
				nickname.html('<span style="color: orange">George Smart, spiller of Fanta, overlord of LIDs</span>')
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
			let extra = {}
			extra_form.serializeArray().forEach(x => {
				extra[x.name] = x.value
			})
			onUpdate(callsign1, callsign2, extra)
			e.preventDefault()
		})
	}
}

export default SpotSearch
