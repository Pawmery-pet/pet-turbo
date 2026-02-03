import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("internal/auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("adapter")
	async handleAdapter(@Body() body: AdapterRequest) {
		return this.authService.handleAdapter(body);
	}
}

export type AdapterOp =
	| "create"
	| "findOne"
	| "findMany"
	| "count"
	| "update"
	| "delete"
	| "updateMany"
	| "deleteMany"
	| "transaction";
export type AdapterModel = "user" | "session" | "account" | "verification";

export type AdapterWhere = {
	field: string;
	operator?: "eq";
	value: string | number | boolean | string[] | number[] | Date | null;
	connector?: "AND";
};

export type AdapterRequest = {
	op: AdapterOp;
	model: AdapterModel;
	data?: Record<string, unknown>;
	where?: AdapterWhere[];
	select?: string[];
	update?: Record<string, unknown>;
	limit?: number;
	offset?: number;
	sortBy?: {
		field: string;
		direction: "asc" | "desc";
	};
	items?: AdapterRequest[];
};
