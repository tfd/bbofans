var request = require('request')

describe("The home page", function() {
	it("should return hello world!", function (done) {
		request("http://localhost:3000", function (err, response, body) {
			console.log(err);
			expect(body).toEqual("<!doctype HTML>\n" +
"<html>\n" +
"<head>\n" +
"</head>\n" +
"<body>\n" +
"	<p>Hello World!</p>\n" +
"</body>\n" +
"</html>");
			done();
		});
	});
});