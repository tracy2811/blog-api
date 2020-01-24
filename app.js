const express = require('express');
const routes = require('./routes');
const app = express();

require('./config/mongo');

app.use(express.json());
app.use(express.urlencoded({ extended: true, }));

app.use('/posts', routes.post);
app.use('/author', routes.author);

app.use((err, req, res, next) => res.sendStatus(404));

app.listen(
	process.env.PORT,
	() => console.log(`Sever started on port ${process.env.PORT}`)
);

