class SpotSearch {
	constructor(props) {
		let {select, onUpdate} = props

		select.tagsinput({
			trimValue: true,
			allowDuplicates: true,
			itemText: input => input.toUpperCase()
		});

		select.on('itemAdded itemRemoved', event => {
			let calls = select.tagsinput('items')
				.map(c => c.toUpperCase())
			onUpdate(calls)
		})
	}
}

export default SpotSearch
