import React, { Component } from 'react'
import { withRouter, Route } from 'react-router-dom';
import logic from '../../logic'
import Search from '../Search/Search'
import { RentalCardSearch } from '../RentalCardSearch/RentalCardSearch'
import './SearchResults.css'


class SearchResults extends Component {
    state = {
        rentals: [],
        error: null,
    }

    componentDidMount() {
        this.searchRentals(this.props.query)
    }

    componentWillReceiveProps(props) {
        this.searchRentals(props.query)
    }

    searchRentals(query) {
        try {
            logic.searchRentals(query)
                .then(rentals => {

                    console.log(rentals)
                    debugger
                    this.setState({ rentals })
                })
                .catch(err => this.setState({ error: err.message }))
        }
        catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleRentalCardClick(id) {
        this.props.history.push(`/rental/${id}`)
    }


    render() {
        return <div className="contain__search">
            <div className="contain__search__form">
                    <Search query={this.props.query} />
            </div>
            <div className="contain__search__title">
                <h4>Your apartments in {this.props.query}:</h4>
            </div>
            <div className="contain__search__results">
                {this.state.rentals.map((rental) => {
                    return <RentalCardSearch id={rental.id} title={rental.title} city={rental.city} street={rental.street} category={rental.category} category={rental.category} bedrooms={rental.bedrooms} description={rental.description} dailyRate={rental.dailyRate} bookings={rental.bookings} key={rental.id} onBookRental={this.handleRentalCardClick} />
                })}
            </div>
        </div>
    }
}


export default withRouter(SearchResults)