const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const jsonpatch = require('jsonpatch');
const Jimp = require('jimp');

const router = express.Router();
const User = require('../Models/User');
const {
	validateSignupData,
	validateLoginData
} = require('../utils/validators');

/**
 * @desc Register Route
 * @route POST /user/register
 * @access Public
 **/
router.post('/register', (req, res) => {
	let newUser = {
		username: req.body.username,
		password: req.body.password
	};

	const { valid, errors } = validateSignupData(newUser);

	if (!valid) return res.status(400).json(errors);

	User.findOne({
		username: newUser.username
	})
		.then((user) => {
			if (user) return res.status(400).json({ msg: 'Username already exists' });
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) return res.status(400).send(err);
					newUser.password = hash;

					new User(newUser).save().then((user) => res.json(user));
				});
			});
		})
		.catch((err) => res.status(400).send(err));
});

/**
 * @desc Login Route
 * @route POST /user/login
 * @access Public
 **/
router.post('/login', (req, res) => {
	const user = {
		username: req.body.username,
		password: req.body.password
	};

	const { valid, errors } = validateLoginData(user);

	if (!valid) return res.status(400).json(errors);

	User.findOne({
		username: req.body.username
	})
		.then((user) => {
			if (!user) return res.status(404).json({ msg: 'Invalid Credentials' });

			bcrypt.compare(req.body.password, user.password).then((isMatch) => {
				if (isMatch) {
					const payload = {
						id: user.id,
						username: user.username
					};
					jwt.sign(
						payload,
						process.env.SECRET,
						{
							expiresIn: '3h'
						},
						(err, token) => {
							if (err) {
								return res.status(500).json({
									msg: 'Something went wrong. Please try again'
								});
							}
							return res.json({
								success: true,
								token: `Bearer ${token}`
							});
						}
					);
				} else {
					return res.status(400).json({
						msg: 'Invalid Credentials'
					});
				}
			});
		})
		.catch((err) => res.status(500).send(err));
});

/**
 * @desc JSONPatch
 * @route PATCH /user/jsonpatch
 * @access Private
 **/
router.patch(
	'/jsonpatch',
	passport.authenticate('jwt', {
		session: false
	}),
	(req, res) => {
		let body = req.body.json;
		let patch = req.body.patch;

		try {
			let patchedDoc = jsonpatch.apply_patch(body, patch);
			res.send(patchedDoc);
		} catch (err) {
			res.status(400).json({
				msg: 'Bad request'
			});
		}
	}
);

/**
 * @desc Thumbnail Generation Route
 * @route POST /user/thumbnail
 * @access Private
 **/
router.post(
	'/thumbnail',
	passport.authenticate('jwt', {
		session: false
	}),
	(req, res) => {
		if (req.body.url === '')
			return res.status(400).json({ msg: 'Add an image URL' });

		Jimp.read(req.body.url)
			.then((image) => {
				return image.resize(50, 50).quality(50).write('thumbnail.jpg');
			})
			.then(() =>
				res.json({
					msg: 'Thumbnail successfully generated'
				})
			)
			.catch((err) => {
				if (err.name === 'MethodName') {
					return res.status(400).json({ msg: 'Invalid URL' });
				} else {
					return res.status(400).json({ msg: 'Invalid URL' });
				}
			});
	}
);

module.exports = router;
