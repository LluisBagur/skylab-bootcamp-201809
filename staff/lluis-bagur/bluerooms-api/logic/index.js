const { User, Rental, Booking, Picture, ProfilePicture } = require('../data')
const { AlreadyExistsError, AuthError, NotAllowedError, NotFoundError } = require('../errors')
const validate = require('../utils/validate')




// ....................  USER LOGIC .....................//

const logic = {
    registerUser(name, surname, username, password, email) { //REGISTER
        validate([{ key: 'name', value: name, type: String }, { key: 'surname', value: surname, type: String }, { key: 'username', value: username, type: String }, { key: 'password', value: password, type: String }, { key: 'email', value: email, type: String }])

        return (async () => {
            let user = await User.findOne({ username })

            if (user) throw new AlreadyExistsError(`username ${username} already registered`)

            user = new User({ name, surname, username, password, email })

            await user.save()
        })()
    },

    authenticateUser(username, password) { //LOGIN - AUTHENTICATIONS
        validate([{ key: 'username', value: username, type: String }, { key: 'password', value: password, type: String }])

        return (async () => {
            const user = await User.findOne({ username })

            if (!user || user.password !== password) throw new AuthError('invalid username or password')

            return user.id
        })()
    },

    retrieveUser(id) { // RETRIEVE USER BY ID
        validate([{ key: 'id', value: id, type: String }])

        return (async () => {
            const user = await User.findById(id, { '_id': 0, password: 0, __v: 0 }).lean().populate('rentals')

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            user.id = id

            const rentals = user.rentals
            rentals.forEach(rental => {
                rental.id=rental._id
                delete rental._id
                delete rental.__v

            });
            return user
        })()
    },

    addProfilePicture(userId, file) {
        validate([
            { key: 'userId', value: userId, type: String },

        ])

        return (async () => {
            let user = await User.findById(userId)

            if (!user) throw new NotFoundError(`user does not exist`)

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((result, error) => {
                    if (error) return reject(error)

                    resolve(result)
                })

                file.pipe(stream)
            })
            profilePicture = new ProfilePicture({ url: result.url, public_id: result.public_id, userId })

            await profilePicture.save()

            user.profilePicture = profilePicture.id

            await user.save()
        })()
    },

    // updateUser(id, name, surname, username, newPassword, password, email) { // UPDATE USERS
    //     validate([
    //         { key: 'id', value: id, type: String },
    //         { key: 'name', value: name, type: String, optional: true },
    //         { key: 'surname', value: surname, type: String, optional: true },
    //         { key: 'username', value: username, type: String, optional: true },
    //         { key: 'password', value: password, type: String, optional: true },
    //         { key: 'email', value: email, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         if (user.password !== password) throw new AuthError('invalid password')

    //         if (username) {
    //             const _user = await User.findOne({ username })

    //             if (_user) throw new AlreadyExistsError(`username ${username} already exists`)

    //             name != null && (user.name = name)
    //             surname != null && (user.surname = surname)
    //             user.username = username
    //             newPassword != null && (user.password = newPassword)

    //             await user.save()
    //         } else {
    //             name != null && (user.name = name)
    //             surname != null && (user.surname = surname)
    //             newPassword != null && (user.password = newPassword)

    //             await user.save()
    //         }
    //     })()
    // },

    //........................... RENTAL LOGIC .......................//

    // ADD RENTAL

    addRental(id, title, city, street, category, image, bedrooms, shared, description, dailyRate) {
        validate([{ key: 'id', value: id, type: String }, { key: 'title', value: title, type: String }, { key: 'city', value: city, type: String }, { key: 'street', value: street, type: String }, { key: 'category', value: category, type: String }, { key: 'image', value: image, type: String }, { key: 'bedrooms', value: bedrooms, type: Number }, { key: 'shared', value: shared, type: Boolean }, { key: 'description', value: description, type: String }, { key: 'dailyRate', value: dailyRate, type: Number }])

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            rental = new Rental({ title, city, street, category, image, bedrooms, shared, description, dailyRate, user: user.id })
            await rental.save()

            user.rentals.push(rental)

            await user.save()

        })()
    },

    //UPDATE RENTAL

    updateRental(id, rentalId, title, city, street, category, image, bedrooms, shared, description, dailyRate) { // UPDATE USERS
        validate([{ key: 'id', value: id, type: String }, { key: 'rentalId', value: rentalId, type: String }, { key: 'title', value: title, type: String }, { key: 'city', value: city, type: String }, { key: 'street', value: street, type: String }, { key: 'category', value: category, type: String }, { key: 'image', value: image, type: String }, { key: 'bedrooms', value: bedrooms, type: Number }, { key: 'shared', value: shared, type: Boolean }, { key: 'description', value: description, type: String }, { key: 'dailyRate', value: dailyRate, type: Number }])

        return (async () => {

            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const rental = await Rental.findById(rentalId)

            if (!rental) throw new NotFoundError(`Rental with id ${id} not found`)

            debugger

            title != null && (rental.title = title)
            city != null && (rental.city = city)
            street != null && (rental.street = street)
            category != null && (rental.category = category)
            image != null && (rental.image = image)
            bedrooms != null && (rental.bedrooms = bedrooms)
            shared != null && (rental.shared = shared)
            description != null && (rental.description = description)
            dailyRate != null && (rental.dailyRate = dailyRate)

            debugger

            await rental.save()
        })()
    },

    //LIST RENTAL BY ID'S

    retriveRentals() {
        return (async () => {
            const rentals = await Rental.find({}).lean()

            rentals.forEach(rental => {
                rental.id=rental._id
                delete rental._id
                delete rental.__v

            });

            return rentals
        })()
    },

    listRentalByUserId(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {
            const user = await User.findById(id,{ '_id': 0, __v: 0 }).populate('rentals').lean().exec()

            const rentals = user.rentals
            rentals.forEach(rental => {
                delete rental._id
                delete rental.__v

            });

            return user.rentals
        })()
    },

    listRentalByRentalId(id, rentalId) {

        validate([{ key: 'id', value: id, type: String },
        { key: 'rentalId', value: rentalId, type: String }
        ])

        return (async () => {
            const user = await User.findById(id).populate('rentals').lean().exec()
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const rental = await Rental.findById(rentalId, { '_id': 0, __v: 0 }).lean().exec()
            if (!rental) throw new NotFoundError(`postit with id ${rentalId} not found`)
            rental.id = rentalId

            return rental
        })()
    },

    listRentalByQuery(query) {

        validate([{ key: 'query', value: query, type: String }])
        
        const city = query
        const _query = city ? {city: city.toLowerCase()} : {};

        return (async () => {
            const rental = await Rental.find( _query, {  __v: 0 }).lean()

            rental.forEach(rental => {
                rental.id=rental._id
                delete rental._id

            });
            return rental
        })()
    },

    retriveRental(rentalId) {

        validate([{ key: 'rentalId', value: rentalId, type: String }])

        debugger

        return (async () => {
            const rental = await Rental.findById(rentalId, {  __v: 0 }).populate('bookings').populate('user').lean().exec()

            rental.user.id = rental.user._id
            delete rental.user._id
            delete rental.user.__v

            rental.id=rental._id
            delete rental._id
            debugger

            return rental
        })()
    },

    //REMOVE

    removeRental(id, rentalId) {
        validate([
            { key: 'id', value: id, type: String },
            { key: 'rentalId', value: rentalId, type: String }
        ])

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const rentals = user.rentals

            const _rent = rentals.filter(_rental => _rental.toString() !== rentalId)

            user.rentals = _rent 

            await user.save() // delete Rewntal ID form User.rentals
            
            const rental = await Rental.findById(rentalId)

            if (!rental) throw new NotFoundError(`postit with id ${rentalId} not found`)

            await rental.remove()

        })()
    },

    
//........................... BOOKING LOGIC .......................//

    // ADD BOOKING

    addBooking(id, rentalId, endAt, startAt, totalPrice, days, guests) {
        validate([{ key: 'id', value: id, type: String }, 
        { key: 'rentalId', value: rentalId, type: String }, 
        { key: 'endAt', value: endAt, type: Date }, 
        { key: 'startAt', value: startAt, type: Date }, 
        { key: 'totalPrice', value: totalPrice, type: Number }, 
        { key: 'days', value: days, type: Number }, 
        { key: 'guests', value: guests, type: Number }])

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const rental = await Rental.findById(rentalId)

            if (!rental) throw new NotFoundError(`rental with id ${rentalId} not found`)

            booking = new Booking({ endAt, startAt, totalPrice, days, guests, user: user.id, rental: rental.id })
            await booking.save()

            user.bookings.push(booking)

            await user.save()

            rental.bookings.push(booking)

            await rental.save()

        })()
    },


    // addCollaborator(id, collaboratorUsername) {
    //     validate([
    //         { key: 'id', value: id, type: String },
    //         { key: 'collaboratorUsername', value: collaboratorUsername, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const collaborator = await User.findOne({ username: collaboratorUsername })

    //         if (!collaborator) throw new NotFoundError(`user with username ${collaboratorUsername} not found`)

    //         if (user.id === collaborator.id) throw new NotAllowedError('user cannot add himself as a collaborator')

    //         user.collaborators.forEach(_collaboratorId => {
    //             if (_collaboratorId === collaborator.id) throw new AlreadyExistsError(`user with id ${id} arleady has collaborator with id ${_collaboratorId}`)
    //         })

    //         user.collaborators.push(collaborator._id)

    //         await user.save()
    //     })()
    // },

    // listCollaborators(id) {
    //     validate([
    //         { key: 'id', value: id, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const collaborators = await Promise.all(user.collaborators.map(async collaboratorId => await User.findById(collaboratorId)))

    //         return collaborators.map(({ id, username }) => ({ id, username }))
    //     })()
    // },

    // /**
    //  * Adds a postit
    //  * 
    //  * @param {string} id The user id
    //  * @param {string} text The postit text
    //  * 
    //  * @throws {TypeError} On non-string user id, or non-string postit text
    //  * @throws {Error} On empty or blank user id or postit text
    //  * 
    //  * @returns {Promise} Resolves on correct data, rejects on wrong user id
    //  */
    // addPostit(id, text) {
    //     validate([
    //         { key: 'id', value: id, type: String },
    //         { key: 'text', value: text, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const postit = new Postit({ text, user: user.id })

    //         await postit.save()
    //     })()
    // },

    // listPostits(id) {
    //     validate([
    //         { key: 'id', value: id, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id).lean()

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const postits = await Postit.find({ user: user._id })
    //             .lean()

    //         postits.forEach(postit => {
    //             postit.id = postit._id.toString()

    //             delete postit._id

    //             postit.user = postit.user.toString()

    //             if (postit.assignedTo)
    //                 postit.assignedTo = postit.assignedTo.toString()

    //             return postit
    //         })

    //         return postits
    //     })()
    // },

    // /**
    //  * Removes a postit
    //  * 
    //  * @param {string} id The user id
    //  * @param {string} postitId The postit id
    //  * 
    //  * @throws {TypeError} On non-string user id, or non-string postit id
    //  * @throws {Error} On empty or blank user id or postit text
    //  * 
    //  * @returns {Promise} Resolves on correct data, rejects on wrong user id, or postit id
    //  */
    // removePostit(id, postitId) {
    //     validate([
    //         { key: 'id', value: id, type: String },
    //         { key: 'postitId', value: postitId, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const postit = await Postit.findOne({ user: user._id, _id: postitId })

    //         if (!postit) throw new NotFoundError(`postit with id ${postitId} not found`)

    //         await postit.remove()
    //     })()
    // },

    // modifyPostit(id, postitId, text) {
    //     validate([
    //         { key: 'id', value: id, type: String },
    //         { key: 'postitId', value: postitId, type: String },
    //         { key: 'text', value: text, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const postit = await Postit.findOne({ user: user._id, _id: postitId })

    //         if (!postit) throw new NotFoundError(`postit with id ${postitId} not found`)

    //         postit.text = text

    //         await postit.save()
    //     })()
    // },

    // movePostit(id, postitId, status) {
    //     validate([
    //         { key: 'id', value: id, type: String },
    //         { key: 'postitId', value: postitId, type: String },
    //         { key: 'status', value: status, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const postit = await Postit.findOne({ user: user._id, _id: postitId })

    //         if (!postit) throw new NotFoundError(`postit with id ${postitId} not found`)

    //         postit.status = status

    //         await postit.save()
    //     })()
    // },

    // assignPostit(id, postitId, collaboratorId) {
    //     validate([
    //         { key: 'id', value: id, type: String },
    //         { key: 'postitId', value: postitId, type: String },
    //         { key: 'collaboratorId', value: collaboratorId, type: String }
    //     ])

    //     return (async () => {
    //         const user = await User.findById(id)

    //         if (!user) throw new NotFoundError(`user with id ${id} not found`)

    //         const postit = await Postit.findOne({ user: user._id, _id: postitId })

    //         if (!postit) throw new NotFoundError(`postit with id ${postitId} not found`)

    //         postit.assignedTo = collaboratorId

    //         await postit.save()
    //     })()
    // }
}

module.exports = logic