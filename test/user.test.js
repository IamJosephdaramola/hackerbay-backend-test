process.env.NODE_ENV = 'test';

let app = require('../server');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

let token = 'null';

describe('/GET login', () => {
	it('should login with correct credentials', (done) => {
		chai
			.request(app)
			.post('/user/login')
			.send({
				username: 'joseph',
				password: '87654321'
			})
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('token');
				done();
			});
	});
	it('should not login with incorrect credentials', (done) => {
		chai
			.request(app)
			.post('/user/login')
			.send({
				username: 'joshua',
				password: '87654321'
			})
			.end((err, res) => {
				res.should.have.status(400);
				done();
			});
	});
});

describe('/PATCH jsonpatch', () => {
	before((done) => {
		chai
			.request(app)
			.post('/user/login')
			.send({
				username: 'joseph',
				password: '87654321'
			})
			.end((err, res) => {
				token = res.body.token;
				done();
			});
	});

	it('should apply the patch when sending correct document', (done) => {
		chai
			.request(app)
			.patch('/user/jsonpatch')
			.set('Authorization', token)
			.send({
				json: {
					baz: 'qux',
					foo: 'bar'
				},
				patch: [
					{
						op: 'replace',
						path: '/baz',
						value: 'patched'
					}
				]
			})
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});

	it('should reject patch if document is not jsonpatch', (done) => {
		chai
			.request(app)
			.patch('/user/jsonpatch')
			.set('Authorization', token)
			.send({
				json: {
					baz: 'qux',
					foo: 'bar'
				}
			})
			.end((err, res) => {
				res.should.have.status(400);
				done();
			});
	});

	it('should not apply patch if token is missing', (done) => {
		chai
			.request(app)
			.patch('/user/jsonpatch')
			.send({
				json: {
					baz: 'qux',
					foo: 'bar'
				},
				patch: [
					{
						op: 'replace',
						path: '/baz',
						value: 'patched'
					}
				]
			})
			.end((err, res) => {
				res.should.have.status(401);
				done();
			});
	});
});

describe('/POST thumbnail', () => {
	before((done) => {
		chai
			.request(app)
			.post('/user/login')
			.send({
				username: 'joseph',
				password: '87654321'
			})
			.end((err, res) => {
				token = res.body.token;
				done();
			});
	});

	it('should create a thumbnail', (done) => {
		chai
			.request(app)
			.post('/user/thumbnail')
			.set('Authorization', token)
			.send({
				url:
					'https://images.pexels.com/photos/1181292/pexels-photo-1181292.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
			})
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});

	it('should not create thumbnail if url is invalid', (done) => {
		chai
			.request(app)
			.post('/user/thumbnail')
			.set('Authorization', token)
			.send({
				url: 'https://www.pexels.com/'
			})
			.end((err, res) => {
				res.should.have.status(400);
				done();
			});
	});

	it('should not create a thumbnail if token is missing', (done) => {
		chai
			.request(app)
			.post('/user/thumbnail')
			.send({
				url: 'https://www.pexels.com/'
			})
			.end((err, res) => {
				res.should.have.status(401);
				done();
			});
	});
});
