process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

let token =
	'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYTA0ZTE3ZjI4NjAyMjM0MDg0OGIwZiIsInVzZXJuYW1lIjoiam9zZXBoIiwiaWF0IjoxNTg3NTY2NzYyLCJleHAiOjE1ODc1Nzc1NjJ9.usr1fcFOQ6eys2enTbT1kM4Dj2V6fTYOV72bA_5387Q';

describe('/GET login', () => {
	it('should login with correct credentials', (done) => {
		chai
			.request(server)
			.post('/user/login')
			.send({
				username: 'joseph',
				password: '12345678'
			})
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('token');
				done();
			});
	});
	it('should not login with incorrect credentials', (done) => {
		chai
			.request(server)
			.post('/user/login')
			.send({
				username: 'joshua',
				password: '87654321'
			})
			.end((err, res) => {
				res.should.have.status(404);
				done();
			});
	});
});

describe('/PATCH jsonpatch', () => {
	before((done) => {
		chai
			.request(server)
			.post('/user/login')
			.send({
				username: 'joseph',
				password: '12345678'
			})
			.end((err, res) => {
				token = res.body.token;
				done();
			});
	});

	it('should apply the patch when sending correct document', (done) => {
		chai
			.request(server)
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
			.request(server)
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
			.request(server)
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
			.request(server)
			.post('/user/login')
			.send({
				username: 'joseph',
				password: '12345678'
			})
			.end((err, res) => {
				token = res.body.token;
				done();
			});
	});

	it('should create a thumbnail', (done) => {
		chai
			.request(server)
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
			.request(server)
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
			.request(server)
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
