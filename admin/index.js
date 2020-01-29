const main = document.querySelector('main');
const message = document.querySelector('#message');
const loginForm = document.querySelector('#login');
const allButton = document.querySelector('#all');
const newButton = document.querySelector('#new');
const HOST = 'https://safe-badlands-07776.herokuapp.com';
let token;

loginForm.addEventListener('submit', function (e) {
	e.preventDefault();
	const data = new FormData(loginForm);
	const body = {};
	for (let pair of data.entries()) {
		body[pair[0]] = pair[1];
	}

	fetch(`${HOST}/author/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	}).then(function (res) {
		if (res.ok) {
			return res.json();
		}
		throw new Error('Invalid Username or Password');
	}).then(function (res) {
		token = res.token;
		displayAllPosts();
	}).catch(function (err) {
		message.textContent = err.message;
	});

});

const removeAllChildren = function (element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
};

const displayAllPosts = function () {
	const title = document.createElement('h1');

	removeAllChildren(main);
	main.appendChild(title);

	fetch(`${HOST}/posts`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'authorization': `bearer ${token}`
		}
	}).then(function (res) {
		return res.json();
	}).then(function (posts) {
		const unpublishedWrapper = document.createElement('div');
		const publishedWrapper = document.createElement('div');
		const unpublishedTitle = document.createElement('h2');
		const publishedTitle = document.createElement('h2');

		let nUnpublished = 0;
		let nPublished = 0;

		unpublishedWrapper.appendChild(unpublishedTitle);
		publishedWrapper.appendChild(publishedTitle);

		posts.forEach(function (post) {
			const wrapper = document.createElement('div');
			const title = document.createElement('h3');
			const introduction = document.createElement('p');
			const date = document.createElement('p');

			title.textContent = post.title;
			title.id = post._id;
			title.style.cursor = 'pointer';
			introduction.textContent = `${post.body.slice(0,100)}...`;
			date.textContent = post.date;

			title.addEventListener('click', function (e) {
				displayPost(`${HOST}/posts/${e.target.id}`);
			});

			wrapper.appendChild(title);
			wrapper.appendChild(introduction);
			wrapper.appendChild(date);

			if (post.published) {
				publishedWrapper.appendChild(wrapper);
				nPublished ++;
			} else {
				unpublishedWrapper.appendChild(wrapper);
				nUnpublished ++;
			}
		});

		title.textContent = `All Posts (${posts.length})`;
		unpublishedTitle.textContent = `Unpublished Posts (${nUnpublished})`;
		publishedTitle.textContent = `Published Posts (${nPublished})`;

		if (posts.length) {
			main.appendChild(publishedWrapper);
			main.appendChild(unpublishedWrapper);
		}
	});
};

const displayPost = function (postURL) {
	fetch(postURL, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'authorization': `bearer ${token}`
		}
	}).then(function (res) {
		return res.json();
	}).then(function (res) {
		const title = document.createElement('h1');
		const date = document.createElement('p');
		const deleteButton = document.createElement('button');
		const post = generatePostForm(res.post);
		const comments = generateComments(res.comments);

		date.textContent = res.post.date;
		deleteButton.textContent = 'Delete';
		title.textContent = 'Editting Post';

		deleteButton.addEventListener('click', function (e) {
			fetch(postURL, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'authorization': `bearer ${token}`
				},
				redirect: 'manual'
			}).then(function (res) {
				displayAllPosts();
			});
		});

		removeAllChildren(main);
		main.appendChild(title);
		main.appendChild(date);
		main.appendChild(deleteButton);
		main.appendChild(post);
		main.appendChild(comments);

	});
};

const generatePostForm = function (post) {
	const wrapper = document.createElement('div');
	const wrapperTitle = document.createElement('h2');
	const form = document.createElement('form');
	const titleLabel = document.createElement('h3');
	const title = document.createElement('input');
	const bodyLabel = document.createElement('h3');
	const body = document.createElement('textarea');
	const selectLabel = document.createElement('h3');
	const select = document.createElement('select');
	const published = document.createElement('option');
	const unpublished = document.createElement('option');
	const save = document.createElement('button');

	wrapperTitle.style.display = 'none';
	titleLabel.textContent = 'Post Title';
	bodyLabel.textContent = 'Post Body';
	title.name = 'title';
	body.name = 'body';
	select.name = 'published';
	published.textContent = 'Published';
	unpublished.textContent = 'Unpublished';
	published.value = 'true';
	unpublished.value = '';
	if (post) {
		wrapperTitle.textContent = 'Edit Post';
		body.textContent = post.body;
		title.value = post.title;
		if (post.published) {
			published.selected = true;
		} else {
			unpublished.selected = true;
		}
	}
	save.textContent = 'Save';

	select.appendChild(published);
	select.appendChild(unpublished);
	form.appendChild(titleLabel);
	form.method = 'POST';
	form.action = '';
	form.appendChild(title);
	form.appendChild(bodyLabel);
	form.appendChild(body);
	form.appendChild(selectLabel);
	form.appendChild(select);
	form.appendChild(save);

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		const data = new FormData(form);
		const url = post ? `${HOST}/posts/${post._id}` : `${HOST}/posts`;
		const method = post ? 'PUT' : 'POST';

		const body = {};
		for (let pair of data.entries()) {
			body[pair[0]] = pair[1];
		}

		fetch(url, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'authorization': `bearer ${token}`
			},
			redirect: "manual",
			body: JSON.stringify(body)
		}).then(function (res) {
			displayAllPosts();
		});
	});

	wrapper.appendChild(wrapperTitle);
	wrapper.appendChild(form);
	return wrapper;
}

const generateComments = function (comments) {
	const wrapper = document.createElement('div');
	const title = document.createElement('h2');

	wrapper.appendChild(title);
	if (comments) {
		const length = comments.length;
		title.textContent = `${length} comment${length >= 2 ? 's' : ''}`;

		comments.forEach(function (comment) {
			const div = document.createElement('div');
			const user = document.createElement('h3');
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

allButton.addEventListener('click', function (e) {
	displayAllPosts();
});

newButton.addEventListener('click', function (e) {
	const title = document.createElement('h1');
	const form = generatePostForm();

	title.textContent = 'Create New Post';
	removeAllChildren(main);
	main.appendChild(title);
	main.appendChild(form);
});

