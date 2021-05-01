const express = require('express')
const app = express()

//GraphQL Config
const expressGraphQL = require('express-graphql').graphqlHTTP

const { GraphQLSchema,
        GraphQLObjectType,GraphQLString,
        GraphQLList,
        GraphQLNonNull,GraphQLInt } = require('graphql')

const { URLSearchParams } = require('url');
global.URLSearchParams = URLSearchParams;

// Sample Data for Authors and BOOKS
const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'Contains Books specification written by author',
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authordId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book)=> {
               return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Contains author specification',
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author)=> {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})


const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation for addition of books/authors',
    fields: ()=> ({
        addBook: {
            type: BookType,
            description: 'Add a Book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authordId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent,args) => {
                const book = {
                    id: books.length+1,
                    name: args.name,
                    authordId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add a Author',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent,args) => {
                const author = {
                    name: args.name,
                    id: authors.length+1
                }
                authors.push(author)
                return author
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
        name: 'listOfbooks',
        description: 'query to list the books',
        fields: ()=> ({

            book: {
                type: BookType,
                description: 'Fetch single book',
                args: {
                    id: {type: GraphQLInt}
                },
                resolve: (parent,args) => books.find(book => book.id === args.id)
            },
            books: {
                type: new GraphQLList(BookType),
                description: 'list of books',
                resolve: ()=> books
            },

            authors: {
                type: new GraphQLList(AuthorType),
                description: 'list of Authors',
                resolve: ()=> authors
            },
            author: {
                type: AuthorType,
                description: 'Fetch single Author',
                args: {
                    id: {type: GraphQLInt}
                },
                resolve: (parent,args) => authors.find(author => author.id === args.id)
            },
        })
})

/**
 * 1.GraphQL wants us to come up with schema for querying the fields
 * 2. inside fields we can place N objects to query which have type of object and function for fetching data (resolve())
 */
const sampleSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'thiyagu',
        fields: ()=> ({
            message : {
                type: GraphQLString,
                resolve: ()=> 'hello this is text'
            }
        })
    })
})

const rootSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

// Single Endpoint which does all HTTP actions --- saves a lot of storage 
app.use('/graphql',expressGraphQL({
    schema:rootSchema,
    graphiql: true
}));

app.listen(5000,()=> console.log("Server is UP on Port 5000"));