import { Controller, Get, Param, Query } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get(":id")
	getById(@Param("id") id: string) {
		return this.userService.getUserById(id);
	}

	@Get()
	getByEmail(@Query("email") email?: string) {
		if (!email) {
			return {
				message: "Use /users/:id or provide ?email=",
			};
		}
		return this.userService.getUserByEmail(email);
	}
}
