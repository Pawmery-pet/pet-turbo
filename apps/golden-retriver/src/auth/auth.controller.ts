import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("internal/auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}
}
