import React from 'react'

import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'

class SpotSearch extends React.Component {
	constructor(props) {
		super(props)
		this.state = {tags: [], input: ''}

		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleTagChange = this.handleTagChange.bind(this)
	}

	handleInputChange(input) {
		this.setState({
			input: input.trimLeft().trimRight().toUpperCase()
		})
	}

	handleTagChange(tags) {
		this.setState({tags})
		this.props.handleSearch(tags);
	}

	render() {
		return (
<TagsInput
	inputValue={this.state.input}
	onChangeInput={this.handleInputChange}
	value={this.state.tags}
	onChange={this.handleTagChange}
	inputProps={{placeholder: ''}}
/>
		);
	}
}

export default SpotSearch
