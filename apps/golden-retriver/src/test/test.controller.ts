import { Controller, Get, Param, Post } from "@nestjs/common";
import { TestService } from "./test.service";

@Controller("test")
export class TestController {
	constructor(private readonly service: TestService) {}

	@Post()
	create() {
		return this.service.create();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.service.findOne(id);
	}
}
