import { createAdapterFactory, type Where } from "better-auth/adapters";

type AdapterResponse<T> = {
	ok: boolean;
	data: T;
	error?: {
		code?: string;
		message?: string;
	};
};

type AdapterRequest = {
	op:
		| "create"
		| "findOne"
		| "findMany"
		| "count"
		| "update"
		| "updateMany"
		| "delete"
		| "deleteMany"
		| "transaction";
	model: string;
	data?: Record<string, unknown>;
	where?: Where[];
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

type AdapterConfig = {
	baseUrl?: string;
};

const DEFAULT_BASE_URL =
	process.env.AUTH_SERVICE_URL ||
	process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
	process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
	"http://localhost:3010";

function normalizeBaseUrl(url: string) {
	return url.replace(/\/$/, "");
}

async function callAdapter<T>(
	baseUrl: string,
	body: AdapterRequest,
): Promise<T> {
	const response = await fetch(`${baseUrl}/internal/auth/adapter`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error(`Auth adapter request failed: ${response.status}`);
	}

	const payload = (await response.json()) as AdapterResponse<T>;
	if (!payload.ok) {
		throw new Error(payload.error?.message || "Auth adapter error");
	}

	return payload.data;
}

export const remoteAuthAdapter = (config: AdapterConfig = {}) =>
	createAdapterFactory({
		config: {
			debugLogs: false,
			transaction: false,
		},
		adapter: ({
			transformInput,
			transformOutput,
			transformWhereClause,
			getDefaultModelName,
		}) => {
			const baseUrl = normalizeBaseUrl(config.baseUrl ?? DEFAULT_BASE_URL);

			return {
				create: async ({ model, data, select, forceAllowId }) => {
					const defaultModel = getDefaultModelName(model);
					const payload = await transformInput(
						data,
						defaultModel,
						"create",
						forceAllowId,
					);
					const result = await callAdapter<Record<string, unknown>>(
						baseUrl,
						{
							op: "create",
							model: defaultModel,
							data: payload,
							select,
						},
					);
					return (await transformOutput(
						result,
						defaultModel,
						select,
					)) as Record<string, unknown>;
				},
				findOne: async ({ model, where, select }) => {
					const defaultModel = getDefaultModelName(model);
					const cleanedWhere = transformWhereClause({
						model,
						where,
					});
					const result = await callAdapter<Record<string, unknown> | null>(
						baseUrl,
						{
							op: "findOne",
							model: defaultModel,
							where: cleanedWhere,
							select,
						},
					);
					if (!result) {
						return null;
					}
					return (await transformOutput(
						result,
						defaultModel,
						select,
					)) as Record<string, unknown>;
				},
				findMany: async ({ model, where, limit, offset, sortBy }) => {
					const defaultModel = getDefaultModelName(model);
					const cleanedWhere = transformWhereClause({
						model,
						where,
					});
					const rows = await callAdapter<Record<string, unknown>[]>(
						baseUrl,
						{
							op: "findMany",
							model: defaultModel,
							where: cleanedWhere,
							limit,
							offset,
							sortBy,
						},
					);
					return Promise.all(
						rows.map((row) =>
							transformOutput(row, defaultModel, undefined),
						),
					) as Promise<Record<string, unknown>[]>;
				},
				count: async ({ model, where }) => {
					const defaultModel = getDefaultModelName(model);
					const cleanedWhere = transformWhereClause({
						model,
						where,
					});
					return callAdapter<number>(baseUrl, {
						op: "count",
						model: defaultModel,
						where: cleanedWhere,
					});
				},
				update: async ({ model, where, update }) => {
					const defaultModel = getDefaultModelName(model);
					const cleanedWhere = transformWhereClause({
						model,
						where,
					});
					const payload = await transformInput(
						update,
						defaultModel,
						"update",
					);
					const result = await callAdapter<Record<string, unknown> | null>(
						baseUrl,
						{
							op: "update",
							model: defaultModel,
							where: cleanedWhere,
							update: payload,
						},
					);
					if (!result) {
						return null;
					}
					return (await transformOutput(
						result,
						defaultModel,
						undefined,
					)) as Record<string, unknown>;
				},
				updateMany: async ({ model, where, update }) => {
					const defaultModel = getDefaultModelName(model);
					const cleanedWhere = transformWhereClause({
						model,
						where,
					});
					const payload = await transformInput(
						update,
						defaultModel,
						"update",
					);
					return callAdapter<number>(baseUrl, {
						op: "updateMany",
						model: defaultModel,
						where: cleanedWhere,
						update: payload,
					});
				},
				delete: async ({ model, where }) => {
					const defaultModel = getDefaultModelName(model);
					const cleanedWhere = transformWhereClause({
						model,
						where,
					});
					await callAdapter<null>(baseUrl, {
						op: "delete",
						model: defaultModel,
						where: cleanedWhere,
					});
				},
				deleteMany: async ({ model, where }) => {
					const defaultModel = getDefaultModelName(model);
					const cleanedWhere = transformWhereClause({
						model,
						where,
					});
					return callAdapter<number>(baseUrl, {
						op: "deleteMany",
						model: defaultModel,
						where: cleanedWhere,
					});
				},
				transaction: async (callback) => {
					const operations: AdapterRequest[] = [];
					const trx = {
						create: async (args: {
							model: string;
							data: Record<string, unknown>;
							select?: string[];
							forceAllowId?: boolean;
						}) => {
							operations.push({
								op: "create",
								model: args.model,
								data: args.data,
								select: args.select,
							});
							return {} as Record<string, unknown>;
						},
						findOne: async () => null,
						findMany: async () => [],
						count: async () => 0,
						update: async (args: {
							model: string;
							where: Where[];
							update: Record<string, unknown>;
						}) => {
							operations.push({
								op: "update",
								model: args.model,
								where: args.where,
								update: args.update,
							});
							return null;
						},
						updateMany: async () => 0,
						delete: async (args: { model: string; where: Where[] }) => {
							operations.push({
								op: "delete",
								model: args.model,
								where: args.where,
							});
						},
						deleteMany: async () => 0,
					};

					await callback(trx as never);

					if (operations.length === 0) {
						return null;
					}

					return callAdapter<unknown[]>(baseUrl, {
						op: "transaction",
						model: "transaction",
						items: operations,
					});
				},
			};
		},
	});
