class SpotSearch {
	constructor(props) {
		let {select, onUpdate} = props

		select.css('text-transform', 'uppercase')
		select.tagsinput({
			trimValue: true,
			allowDuplicates: true
		})

		select.on('beforeItemAdd', event => {
			event.item = event.item.toUpperCase()
			console.log(event)
		})

		select.on('itemAdded itemRemoved', event => {
			let calls = select.tagsinput('items')
				.map(c => c.toUpperCase())
			onUpdate(calls)
		})
	}
}

export default SpotSearch
