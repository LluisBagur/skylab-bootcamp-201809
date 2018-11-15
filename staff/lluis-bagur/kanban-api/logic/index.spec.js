require('dotenv').config()

const mongoose = require('mongoose')
const { User, Postit } = require('../data')
const logic = require('.')
const { AlreadyExistsError } = require('../errors')

const { expect } = require('chai')

// const { env: { MONGO_URL } } = process

// running test from CLI
// normal -> $ mocha src/logic.spec.js --timeout 10000
// debug -> $ mocha debug src/logic.spec.js --timeout 10000

describe('logic', () => {
    before(() => mongoose.connect('mongodb://localhost:27017/postit-test', { useNewUrlParser: true }))

    beforeEach(() => Promise.all([User.deleteMany(), Postit.deleteMany()]))

    describe('user', () => {
        describe('register', () => {
            let name, surname, username, password

            beforeEach(() => {
                name = `name-${Math.random()}`
                surname = `surname-${Math.random()}`
                username = `username-${Math.random()}`
                password = `password-${Math.random()}`
            })

            it('should succeed on correct data', async () => {
                const res = await logic.registerUser(name, surname, username, password)

                expect(res).to.be.undefined

                const users = await User.find()

                expect(users.length).to.equal(1)

                const [user] = users

                expect(user.id).to.be.a('string')
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.username).to.equal(username)
                expect(user.password).to.equal(password)
            })


            it('should fail on undefined name', () => {
                expect(() => logic.registerUser(undefined, surname, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases
        })

        describe('authenticate', () => {
            let user

            beforeEach(() => (user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })).save())


            it('should authenticate on correct credentials', async () => {
                const { username, password } = user

                const id = await logic.authenticateUser(username, password)

                expect(id).to.exist
                expect(id).to.be.a('string')

                users = await User.find()
                const [_user] = users

                expect(_user.id).to.equal(id)
            })

            it('should fail on undefined username', () => {
                expect(() => logic.authenticateUser(undefined, user.password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases
        })

        describe('retrieve', () => {
            let user

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                await user.save()
            })

            it('should succeed on valid id', async () => {
                const _user = await logic.retrieveUser(user.id)

                expect(_user).not.to.be.instanceof(User)

                const { id, name, surname, username, password } = _user

                expect(id).to.exist
                expect(id).to.equal(user.id)
                expect(name).to.equal(user.name)
                expect(surname).to.equal(user.surname)
                expect(username).to.equal(user.username)
                expect(password).to.be.undefined
            })

        })

        describe('update', () => {
            let user

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                await user.save()
            })

            it('should update on correct data and password', async () => {
                const { id, name, surname, username, password } = user

                const newName = `${name}-${Math.random()}`
                const newSurname = `${surname}-${Math.random()}`
                const newUsername = `${username}-${Math.random()}`
                const newPassword = `${password}-${Math.random()}`

                const res = await logic.updateUser(id, newName, newSurname, newUsername, newPassword, password)

                const users = await User.find()

                const [_user] = users

                expect(_user.id).to.equal(id)
                expect(_user.name).to.equal(newName)
                expect(_user.surname).to.equal(newSurname)
                expect(_user.username).to.equal(newUsername)
                expect(_user.password).to.equal(newPassword)
            })

            it('should update on correct id, name and password (other fields null)', async () => {
                const { id, name, surname, username, password } = user

                const newName = `${name}-${Math.random()}`

                const res = await logic.updateUser(id, newName, null, null, null, password)
                const users = await User.find()
                const [_user] = users

                expect(_user.id).to.equal(id)

                expect(_user.name).to.equal(newName)
                expect(_user.surname).to.equal(surname)
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
            })

            it('should update on correct id, surname and password (other fields null)', async () => {
                const { id, name, surname, username, password } = user

                const newSurname = `${surname}-${Math.random()}`

                const res = await logic.updateUser(id, null, newSurname, null, null, password)
                const users = await User.find()
                const [_user] = users

                expect(_user.id).to.equal(id)

                expect(_user.name).to.equal(name)
                expect(_user.surname).to.equal(newSurname)
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
            })

            // TODO other combinations of valid updates

            it('should fail on undefined id', () => {
                const { id, name, surname, username, password } = user

                expect(() => logic.updateUser(undefined, name, surname, username, password, password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases

            describe('with existing user', () => {
                let user2

                beforeEach(async () => {
                    user2 = new User({ name: 'John', surname: 'Doe', username: 'jd2', password: '123' })

                    await user2.save()

                })

                it('should update on correct data and password', async () => {
                    const { id, name, surname, username, password } = user2

                    const newUsername = 'jd'

                    try {
                        await logic.updateUser(id, null, null, newUsername, null, password)
                    } catch (err) {

                        expect(err).to.be.instanceof(AlreadyExistsError)

                        const _user = await User.findById(id)
                        expect(_user.id).to.equal(id)

                        expect(_user.name).to.equal(name)
                        expect(_user.surname).to.equal(surname)
                        expect(_user.username).to.equal(username)
                        expect(_user.password).to.equal(password)
                    }
                })


            })
        })
    })

    describe('buddies', () => {
        describe('add', () => {
            let user, user2

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                user2 = new User({ name: 'John2', surname: 'Doe2', username: 'jd2', password: '1232' })

                await user.save()
                await user2.save()
            })

            it('should update on correct id and username', async () => {


                await logic.addBuddy(user.id, user2.username)

                const _user = await User.findById(user.id)

                expect(_user.buddies.length).to.equal(1)

                expect(_user.buddies[0].toString()).to.equal(user2.id)

            })

            it('should fail on undefined id', () => {
                const { username } = user2

                expect(() => logic.addBuddy(undefined, username).to.throw(TypeError, 'undefined is not a string'))
            })
        })

        describe('list', () => {
            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                user2 = new User({ name: 'John2', surname: 'Doe2', username: 'jd2', password: '123' })
                user3 = new User({ name: 'John3', surname: 'Doe3', username: 'jd3', password: '123' })

                user.buddies.push(user2.id)
                user.buddies.push(user3.id)

                await user.save()
                await user2.save()
                await user3.save()
            })

            it('should succeed on correct data', async () => {
                const _buddies = await logic.listBuddies(user.id)

                expect(_buddies.length).to.equal(2)

                expect(user.buddies[0].toString()).to.equal(user2.id)
                expect(user.buddies[1].toString()).to.equal(user3.id)

            })
        })
    })

    describe('postits', () => {
        describe('add', () => {
            let user, text, status

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                text = `text-${Math.random()}`
                status = 'todo'

                await user.save()
            })

            it('should succeed on correct data', async () => {
                await logic.addPostit(user.id, text, status)

                const postits = await Postit.find()
                const [postit] = postits

                expect(postit.status).to.equal(status)
                expect(postit.user.toString()).to.equal(user.id)
                expect(postit.text).to.equal(text)

            })

            // TODO other test cases
        })

        describe('list', () => {
            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                user2 = new User({ name: 'John2', surname: 'Doe2', username: 'jd2', password: '123' })
                user3 = new User({ name: 'John3', surname: 'Doe3', username: 'jd3', password: '123' })

                user.buddies.push(user2.id)
                user.buddies.push(user3.id)

                await user.save()
                await user2.save()
                await user3.save()
            })

            it('should succeed on correct data', async () => {
                const _buddies = await logic.listBuddies(user.id)

                expect(_buddies.length).to.equal(2)

                expect(_buddies[0]).to.equal(user2.username)
                expect(_buddies[1]).to.equal(user3.username)

            })
        })

        describe('remove', () => {
            let user, postit

            beforeEach(async () => {

                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                postit = new Postit({ text: 'hello text', status: 'todo', user: user.id })

                await user.save()
                await postit.save()
            })

            it('should succeed on correct data', async () => {
                await logic.removePostit(user.id, postit.id)
                const postits = await Postit.find()
                expect(postits.length).to.equal(0)
            })
        })

        describe('modify', () => {
            let user, postit, newText

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                postit = new Postit({ text: 'hello text', status: 'todo', user: user.id })

                newText = `new-text-${Math.random()}`
                newStatus = 'done'

                await user.save()
                await postit.save()
            })

            it('should succeed on correct data', async () => {
                await logic.modifyPostit(user.id, postit.id, newText, newStatus)
                const postits = await Postit.find()
                expect(postits.length).to.equal(1)

                const [_postit] = postits

                expect(_postit.id).to.equal(postit.id)

                expect(_postit.text).to.equal(newText)
                expect(_postit.status).to.equal(newStatus)
            })
        })


        describe('assign to', ()=>{
            let user, postit

            beforeEach(() => {

                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                user2 = new User({ name: 'John2', surname: 'Doe2', username: 'jd2', password: '123' })
                postit = new Postit({ text: 'hello text', user: user.id, status: 'TODO' })

                return Promise.all([user.save(), postit.save()])
            })

            it('should succeed on correct data', async () => {

                const res = await logic.assignToUser(postit.id, user2.id)

                expect(res).to.be.undefined

                const postits = await Postit.find()

                expect(postits.length).to.equal(1)

                const [_postit] = postits
                
                expect(_postit.assignedTo.toString()).to.equal(user2.id)
                
            })
        })
    })


    after(() => mongoose.disconnect())
})