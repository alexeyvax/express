const express = require( 'express' );
const ejs = require( 'ejs' );
const fs = require( 'fs' );
const bodyParser = require( 'body-parser' );

const app = express();

const config = {
	path: {
		root: __dirname,
		src: __dirname + '/src',
		fixture: __dirname + '/fixture',
		scripts: __dirname + '/scripts',
		styles: __dirname + '/styles'
	}
};

const storeChangeComment = Object.create( null );

// подключаю папки со скриптами и прочие файлы
// app.use( express.static( config.path.fixture ) );
app.use( '/fixture', express.static( config.path.fixture ) );
app.use( '/scripts',  express.static( config.path.scripts ) );
app.use( '/styles',  express.static( config.path.styles ) );

app.use(
	( req, res, next ) =>
	{
		res.header( "Access-Control-Allow-Origin", "*" );
		res.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" );
		res.header( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE' );
		next();
	}
);

// app.use( bodyParser.json() );
// app.use( bodyParser.urlencoded( { extended: true } ) );

var bpurle= bodyParser.urlencoded({ extended: true });
var bpjson= bodyParser.json();

app.disable( 'x-powered-by' );

app.set( 'view engine', 'ejs' );
app.engine( 'html', ejs.renderFile );

const pages = [
	'index',
	'first',
	'second',
	'comments'
];

app.get(
	'/:page?',
	(req, res) =>
	{
		let page = req.params.page;
	
		if ( !page )
		{
			page = 'index';
		}
		
		if ( pages.indexOf( page ) === -1 )
		{
			res.status( 404 ).render( '404.html' );
		}
		
		// вывод на экран всех комментариев
		/*if ( page === 'comments' )
		{
			console.log( JSON.parse( fs.readFileSync( config.path.fixture + '/comments.json' ) ) );

			res.send( JSON.stringify( JSON.parse( fs.readFileSync( config.path.fixture + '/comments.json' ) ) ) );
		}*/
		
		res.render( page + '.html' );
	}
);

app.post(
	'/comments',
	bpjson,
	( req, res ) =>
	{
		const file = config.path.fixture + '/comments.json';
		const data = JSON.parse( fs.readFileSync( file ) );
		const response = req.body;
		
		response.id = Math.round( Math.random() * 1000000 ) + Date.now();
	
		data.push( response );
		
		fs.writeFileSync( file, JSON.stringify( data, null, 2 ), 'utf8' );
		
		res.send( JSON.stringify( response ) );
	}
);

app.route( '/comments/:id' )
	.get(
		( req, res ) =>
		{
			const data = JSON.parse( fs.readFileSync( config.path.fixture + '/comments.json' ) );

			// let needle = {};
			// const result = data.some( searchItem );
			data.some( searchItem );

			function searchItem( item )
			{
				if ( String( item.id ) === req.params.id )
				{
					/*storeChangeComment[String( item.id )] = item;
					storeChangeComment['key'] = String( item.id );*/
					storeChangeComment['comment'] = item;
					
					// needle = String( item.id );
					return true;
				}
				else
				{
					return false;
				}
			}
			
			res.send( JSON.stringify( storeChangeComment ) );
		}
	)
	.put(
		bpjson,
		( req, res ) =>
		{
			const file = config.path.fixture + '/comments.json';
			const data = JSON.parse( fs.readFileSync( config.path.fixture + '/comments.json' ) );

			const response = req.body;
			
			let needle = {};
			const changeCandidate = data.some( searchItem );

			function searchItem( item )
			{
				if ( item.id == response['key'] )
				{
					item.content = response['change'];
					needle = item;
					return true;
				}
				else
				{
					return false;
				}
			}
			
			if ( changeCandidate )
			{
				fs.writeFileSync( file, JSON.stringify( data, null, 2 ), 'utf8' );
			}

			res.send( JSON.stringify( changeCandidate ) );
		}
	)
	.delete(
		( req, res ) =>
		{
			const file = config.path.fixture + '/comments.json';
			const data = JSON.parse( fs.readFileSync( config.path.fixture + '/comments.json' ) );
			
			let needle = {};
			const deleteCandidate = data.some( searchItem );
			
			function searchItem( item )
			{
				if ( String( item.id ) === req.params.id )
				{
					needle = item;
					return true;
				}
				else
				{
					return false;
				}
			}
			
			if ( deleteCandidate )
			{
				data.splice( data.indexOf( needle ), 1 );
				
				fs.writeFileSync( file, JSON.stringify( data, null, 2 ), 'utf8' );
			}
			
			res.send( JSON.stringify( needle ) );
		}
	);

app.listen( 3004, ()=> console.log( 'Started connect web server for REST API on http://localhost:3004' ) );

// *********************************************************



