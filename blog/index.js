const HOST = 'https://safe-badlands-07776.herokuapp.com';

const title = document.querySelector('title');
const home = document.querySelector('#home');
const author = document.querySelector('#author');
const main = document.querySelector('#main');

const removeAllChildren = function (element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

fetch(HOST + '/author')
	.then(function (res) {
		return res.json();
	})
	.then(function (res) {
		const name = document.createElement('h2');
		const introduction = document.createElement('p');
		const fullname = `${res.firstName} ${res.lastName}`;

		name.textContent = fullname;
		introduction.textContent = res.introduction;

		author.appendChild(name);
		author.appendChild(introduction);

		home.textContent = `${fullname}'s Blog`;
		title.textContent = `${fullname}'s Blog`;
	});

const displayAllPosts = function () {
	removeAllChildren(main);
	fetch(`${HOST}/posts`)
		.then(function (res) {
			return res.json();
		}).then(function (res) {
			res.forEach(function (post) {
				const div = document.createElement('div');
				const title = document.createElement('h2');
				const introduction = document.createElement('p');
				const date = document.createElement('p');

				title.textContent = post.title;
				introduction.textContent = `${post.body.slice(0, 100)}...`;
				date.textContent = post.date;
				title.dataset.postID = post._id;
				div.dataset.postID = post._id;
				div.style.cursor = 'pointer';
				introduction.dataset.postID = post._id;
				date.dataset.postID = post._id;
				div.addEventListener('click', function (e) {
					displayPost(`${HOST}/posts/${e.target.dataset.postID}`);
				});

				div.appendChild(title);
				div.appendChild(introduction);
				div.appendChild(date);

				main.appendChild(div);
			});
		});
};

const displayPost = function (postURL) {
	removeAllChildren(main);
	fetch(postURL).then(function (res) {
		return res.json();
	}).then(function (res) {
		const title = document.createElement('h2');
		const date = document.createElement('p');
		const body = generatePostBody(res.post);
		const comments = generateComments(res.comments);
		const form = generateCommentForm(postURL);

		date.textContent = res.post.date;
		title.textContent = res.post.title;

		main.appendChild(title);
		main.appendChild(date);
		main.appendChild(body);
		main.appendChild(form);
		main.appendChild(comments);
	});
};

const generatePostBody = function (post) {
	const wrapper = document.createElement('div');
	const title = document.createElement('h3');
	const body = document.createElement('p');

	title.textContent = 'Post Body';
	title.style.display = 'none';
	body.textContent = post.body;

	wrapper.appendChild(title);
	wrapper.appendChild(body);

	return wrapper;
}

const generateComments = function (comments) {
	const wrapper = document.createElement('div');
	const title = document.createElement('h3');

	wrapper.appendChild(title);
	if (comments) {
		const length = comments.length;
		title.textContent = `${length} comment${length >= 2 ? 's' : ''}`;

		comments.forEach(function (comment) {
			const div = document.createElement('div');
			const user = document.createElement('h4');
			const body = document.createElement('p');
			const date = document.createElement('p');

			user.textContent = comment.name ? comment.name : 'anonymous';
			body.textContent = comment.body;
			date.textContent = comment.date;

			div.appendChild(user);
			div.appendChild(date);
			div.appendChild(body);
			wrapper.appendChild(div);
		});
	} else {
		title.textContent = 'No Comments'
	}
	return wrapper;
}

const generateCommentForm = function (postURL) {
	const wrapper = document.createElement('div');
	const title = document.createElement('h3');
	const form = document.createElement('form');
	const name = document.createElement('input');
	const body = document.createElement('input');
	const submit = document.createElement('button');

	title.textContent = 'Share your thought';
	form.method = 'POST';
	name.name = 'name';
	name.placeholder = 'Your Name';
	body.name = 'body';
	body.placeholder = 'Your Comment';
	body.required = true;
	submit.textContent = 'Post';

	form.appendChild(name);
	form.appendChild(body);
	form.appendChild(submit);
	wrapper.appendChild(title);
	wrapper.appendChild(form);

	form.addEventListener('submit', function (e) {
		// on form submission, prevent default
		e.preventDefault();
		// contruct FormData object, which fires the formdata event
		const data = new FormData(form);

		const body = {};
		for (let pair of data.entries()) {
			body[pair[0]] = pair[1];
		}

		fetch(`${postURL}/comments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		}).then(function (res) {
			return res.json();
		}).then(function (res) {
			displayPost(postURL);
		});
	});

	return wrapper;
}

displayAllPosts();

