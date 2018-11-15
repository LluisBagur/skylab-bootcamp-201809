import React, { Component } from 'react'
import logic from '../logic'
import InputForm from './InputForm'
import Addbuddy from './Addbuddy'
import Post from './Post'

class Postits extends Component {
    state = { postits: [], assignedTo: [], buddies: [] }

    componentDidMount() {
        logic.listPostits()
            .then(postits => { this.setState({ postits }) })

    }

    handleSubmit = (text, status) => {
        try {
            status = 'TODO'
            logic.addPostit(text, status)
                .then(() => logic.listPostits())
                .then(postits => this.setState({ postits }))
        } catch ({ message }) {
            alert(message) // HORROR! FORBIDDEN! ACHTUNG!
        }
    }

    // TODO error handling!

    handleRemovePostit = id =>
        logic.removePostit(id)
            .then(() => logic.listPostits())
            .then(postits => this.setState({ postits }))

    // TODO error handling!


    handleModifyPostit = (id, text, status) => {
        if (status === undefined) {
            return logic.modifyPostit(id, text, status = 'TODO')
                .then(() => logic.listPostits())

                .then(postits => this.setState({ postits }))

        } else {
            return logic.modifyPostit(id, text, status)
                .then(() => logic.listPostits())

                .then(postits => this.setState({ postits }))
        }
    }

    handleAddBuddie = (text) => {
        try {
            logic.addBuddie(text)
        } catch ({ message }) {
            alert(message) // HORROR! FORBIDDEN! ACHTUNG!
        }
    }

    handleAssignBuddy = (id, assignedTo) =>{

    
    try {
            
        logic.assignBuddie(id, assignedTo)
            .then(()=> {
                this.setState({assignedTo})
            })
            .then(() => logic.listBuddies())
            .then(buddies => {
                this.setState({ buddies })
            })
    } catch ({ message }) {
        this.setState({ error: message })
    }

   }

    // TODO error handling!


    render() {
        return <div className="kanban__post">
            <section className="newPost">
                <InputForm onSubmit={this.handleSubmit} />
            </section>
            <div className="buddie">
                <section className="addBuddie">
                    <p className="addBuddie__text">Add buddies here</p>
                    <Addbuddy onSubmit={this.handleAddBuddie} />
                </section>
            </div>
            <div className="columns">
                <section className="columns_posts">
                    <h2>TODO</h2>
                    {this.state.postits.filter(postit => postit.status === "TODO").map(postit => <Post key={postit.id} text={postit.text} id={postit.id} status={postit.status} assignedTo={postit.assignedTo} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAssignBuddy={this.handleAssignBuddy} />)}
                </section>
                <section className="columns_posts">
                    <h2>DOING</h2>
                    {this.state.postits.filter(postit => postit.status === "DOING").map(postit => <Post key={postit.id} text={postit.text} id={postit.id} status={postit.status} assignedTo={postit.assignedTo} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAssignBuddy={this.handleAssignBuddy} />)}
                </section>
                <section className="columns_posts">
                    <h2>REVIEW</h2>
                    {this.state.postits.filter(postit => postit.status === "REVIEW").map(postit => <Post key={postit.id} text={postit.text} id={postit.id} status={postit.status} assignedTo={postit.assignedTo} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAssignBuddy={this.handleAssignBuddy} />)}
                </section>
                <section className="columns_posts">
                    <h2>DONE</h2>
                    {this.state.postits.filter(postit => postit.status === "DONE").map(postit => <Post key={postit.id} text={postit.text} id={postit.id} status={postit.status} assignedTo={postit.assignedTo} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAssignBuddy={this.handleAssignBuddy}/>)}
                </section>

            </div>
            

        </div>
    }
}

export default Postits
