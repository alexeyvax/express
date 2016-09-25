'use strict';
(function()
{
	const endpoint = 'http://localhost:3004/';
	const form = document.getElementById( 'comment-form' );
	const container = document.getElementById( 'container' );
	const outputResult = document.querySelector( 'div.output' );
	
	window.addEventListener(
		'load',
		() =>
		{
			ajax(
				'GET',
				endpoint,
				'fixture/comments.json',
				null,
				( response ) =>
				{
					const list = JSON.parse( response );
					let comment;
					let commentContainer;
					
					Array.prototype.forEach.call(
						list,
						( item, index ) =>
						{
							comment = list[index].content;
							commentContainer = createElement();
							container.appendChild( commentContainer[0] );
							commentContainer[1].parentNode.id = list[index].id;
							commentContainer[1].textContent = comment;
						}
					)
				}
			);
		}
	);

	function targetItemChange( event )
	{
		if ( container.contains( event.target ) )
		{
			const item = event.target.parentNode;
			
			ajax(
				'GET',
				endpoint,
				'comments/' + item.id,
				null,
				( response ) =>
				{
					//***************************************
					/*const comment = JSON.parse( response );
					const key = comment['key'];
					const content = comment[key].content;
					const item = document.getElementById( key );
					console.log( comment );
					console.log( key );
					console.log( content );
					const inputChange = document.createElement( 'input' );
					
					item.classList.add( 'change' );
					
					inputChange.value = comment;
					inputChange.classList.add( 'change' );
					item.appendChild( inputChange );*/
					//*******************************
					const comment = JSON.parse( response )['comment'];
					const item = document.getElementById( comment.id );
					const inputChange = document.createElement( 'input' );
					
					item.classList.add( 'change' );
					
					inputChange.value = comment.content;
					inputChange.classList.add( 'change' );
					item.appendChild( inputChange );
				}
			);
		}
	}
	
	function targetItemSave( event )
	{
		if ( container.contains( event.target ) )
		{
			const item = event.target.parentNode;
			const input = item.querySelector( 'input.change' );
			const comment = item.querySelector( 'div' );
			const body = {};

			body['change'] = input.value;
			body['key'] = item.id;
			
			ajax(
				'PUT',
				endpoint,
				'comments/' + item.id,
				body,
				( response ) =>
				{
					if ( response )
					{
						comment.textContent = input.value;
						item.removeChild( input );
						item.classList.remove( 'change' );
					}
				}
			);
		}
	}
	
	function targetItemClose( event )
	{
		if ( container.contains( event.target ) )
		{
			const item = event.target.parentNode;
			const input = item.querySelector( 'input.change' );

			item.removeChild( input );
			item.classList.remove( 'change' );
		}
	}
	
	function targetItemRemove( event )
	{
		if ( container.contains( event.target ) )
		{
			var item = event.target.parentNode;
			
			ajax(
				'DELETE',
				endpoint,
				'comments/' + item.id,
				null,
				( response ) =>
				{
					const item = document.getElementById( JSON.parse( response ).id );
					
					item.parentElement.removeChild( item );
				}
			);
		}
	}

	form.addEventListener(
		'submit',
		( event ) =>
		{
			event.preventDefault();

			const input = document.getElementById( 'entry' );
			const body = {};

			body[input.name] = input.value;
			
			ajax(
				'POST',
				endpoint,
				'comments/',
				body,
				( response ) =>
				{
					let comment = JSON.parse( response );
					let commentContainer;

					commentContainer = createElement();
					container.appendChild( commentContainer[0] );
					commentContainer[1].parentNode.id = comment.id;
					commentContainer[1].textContent = comment.content;

					form.reset();
				}
			);
		}
	);
	
	function ajax( method, endpoint, url, body, success )
	{
		const request = new XMLHttpRequest();

		// использовать для POST чтобы автоматом кодировало в нужный формат,
		// если не использовать bodyParser
		// const data = new FormData( JSON.stringify( body ) );
		// data.append( 'content', JSON.stringify( body ) );
		
		request.addEventListener( 'load', send );
		request.open( method, endpoint + url );
		request.setRequestHeader( 'Content-type', 'application/json; charset=utf-8' );
		request.send( body ? JSON.stringify( body ) : undefined );
		// request.send( data );
		
		function send()
		{
			if ( request.readyState === XMLHttpRequest.DONE
				&& request.status === 200 )
			{
				success( request.responseText );
				
				// console.log( request.responseText );
			}
			else
			{
				console.log( 'Не прочитано' );
			}
		}
	}
	
	function createElement()
	{
		var commentContainer = document.createElement( 'div' );
		var messageContainer = document.createElement( 'div' );
		var buttonChange = document.createElement( 'button' );
		var buttonRemove = document.createElement( 'button' );
		var buttonClose = document.createElement( 'button' );
		var buttonSave = document.createElement( 'button' );

		commentContainer.classList.add( 'comment' );
		buttonChange.classList.add( 'change' );
		buttonRemove.classList.add( 'remove' );
		buttonClose.classList.add( 'close' );
		buttonSave.classList.add( 'save' );
		buttonChange.textContent = 'changeComment';
		buttonRemove.textContent = 'removeComment';
		buttonClose.textContent = 'close';
		buttonSave.textContent = 'save';
		buttonChange.addEventListener( 'click', ( event ) => targetItemChange( event ) );
		buttonRemove.addEventListener( 'click', ( event ) => targetItemRemove( event ) );
		buttonClose.addEventListener( 'click', ( event ) => targetItemClose( event ) );
		buttonSave.addEventListener( 'click', ( event ) => targetItemSave( event ) );
		commentContainer.appendChild( messageContainer );
		commentContainer.appendChild( buttonChange );
		commentContainer.appendChild( buttonRemove );
		commentContainer.appendChild( buttonClose );
		commentContainer.appendChild( buttonSave );

		return [commentContainer, messageContainer];
	}
	
})();
