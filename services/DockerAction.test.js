
describe("DockerAction", function() {

	beforeEach(function() {
		module("KDockerWeb")
	});

	var DockerAction;

	beforeEach(inject(function (_DockerAction_) {
		DockerAction = _DockerAction_;
	}));

	it("should be a object", function () {
		expect(typeof DockerAction).toBe("object");
	});

	it("parseRepoTag", function () {
		var repotag;

		repotag = DockerAction.parseRepoTag("ubuntu");
		expect(repotag.repo).toBe("ubuntu");
		expect(repotag.tag).toBe("latest");

		repotag = DockerAction.parseRepoTag("tsaikd/ubuntu");
		expect(repotag.repo).toBe("tsaikd/ubuntu");
		expect(repotag.tag).toBe("latest");

		repotag = DockerAction.parseRepoTag("tsaikd/ubuntu:stable");
		expect(repotag.repo).toBe("tsaikd/ubuntu");
		expect(repotag.tag).toBe("stable");

		repotag = DockerAction.parseRepoTag("registry.tsaikd.org:5000/tsaikd/ubuntu:stable");
		expect(repotag.repo).toBe("registry.tsaikd.org:5000/tsaikd/ubuntu");
		expect(repotag.tag).toBe("stable");
	});

});