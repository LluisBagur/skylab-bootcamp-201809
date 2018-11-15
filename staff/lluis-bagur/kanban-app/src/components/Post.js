import React, { Component } from 'react'
import logic from '../logic'

class Post extends Component {
    state = { id: this.props.id, text: this.props.text, status: this.props.status, buddies: [], assignedTo: this.props.assignedTo }

    componentDidMount() {
        logic.listBuddies()
            .then(buddies => this.setState({ buddies }))
    }


    handleChange = event => {
        const text = event.target.value

        this.setState({ text })
    }

    handleBlur = () => {
        this.props.onUpdatePost(this.props.id, this.state.text, this.state.status)
    }

    handleStatusChange = event => {
        event.preventDefault()

        const status = event.target.value

        this.setState({ status })
        this.props.onUpdatePost(this.props.id, this.state.text, status)
    }

    handleInput = event => {
        event.preventDefault()

        const assignedTo = event.target.value
        this.setState({ assignedTo })
        this.props.onAssignBuddy(this.props.id, assignedTo)

    }


    render() {
        return <article className="post">

            <div className="post_text">
                <textarea className="post_input" defaultValue={this.state.text} onChange={this.handleChange} onBlur={this.handleBlur} />
            </div>
            <div className="post_buttons">
                <div>
                    <button className="btnt_delete" onClick={() => this.props.onDeletePost(this.props.id)}><p>Delete</p></button>
                </div>
                <div className="post_status">
                    <select className="select_status" defaultValue={this.props.assignTo ? this.props.assignTo : 'select buddy'} onChange={this.handleInput}>
                        {this.state.buddies.map(buddie => <option value={buddie} >{buddie}</option>)}

                    </select>
                </div>
                <div className="post_status" >
                    <select defaultValue={this.state.status} className="select_status" onChange={this.handleStatusChange}>
                        <option type='button' value="TODO" onClick={this.handleStatusChange}>TODO</option>
                        <option type='button' value="DOING" onClick={this.handleStatusChange}>DOING</option>
                        <option type='button' value="REVIEW" onClick={this.handleStatusChange}>REVIEW</option>
                        <option type='button' value="DONE" onClick={this.handleStatusChange}>DONE</option>
                    </select>
                </div >
            </div >
        </article >
    }
}

export default Post