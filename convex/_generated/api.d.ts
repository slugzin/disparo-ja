/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_buscarLocalizacoes from "../actions/buscarLocalizacoes.js";
import type * as actions_captarEmpresas from "../actions/captarEmpresas.js";
import type * as actions_evolutionApi from "../actions/evolutionApi.js";
import type * as actions_index from "../actions/index.js";
import type * as actions_processarDisparos from "../actions/processarDisparos.js";
import type * as mutations_campanhas from "../mutations/campanhas.js";
import type * as mutations_conversas from "../mutations/conversas.js";
import type * as mutations_disparos from "../mutations/disparos.js";
import type * as mutations_empresas from "../mutations/empresas.js";
import type * as mutations_leads from "../mutations/leads.js";
import type * as mutations_profiles from "../mutations/profiles.js";
import type * as mutations_templates from "../mutations/templates.js";
import type * as mutations_whatsappInstances from "../mutations/whatsappInstances.js";
import type * as queries_campanhas from "../queries/campanhas.js";
import type * as queries_conversas from "../queries/conversas.js";
import type * as queries_dashboard from "../queries/dashboard.js";
import type * as queries_disparos from "../queries/disparos.js";
import type * as queries_empresas from "../queries/empresas.js";
import type * as queries_leads from "../queries/leads.js";
import type * as queries_profiles from "../queries/profiles.js";
import type * as queries_templates from "../queries/templates.js";
import type * as queries_whatsappInstances from "../queries/whatsappInstances.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/buscarLocalizacoes": typeof actions_buscarLocalizacoes;
  "actions/captarEmpresas": typeof actions_captarEmpresas;
  "actions/evolutionApi": typeof actions_evolutionApi;
  "actions/index": typeof actions_index;
  "actions/processarDisparos": typeof actions_processarDisparos;
  "mutations/campanhas": typeof mutations_campanhas;
  "mutations/conversas": typeof mutations_conversas;
  "mutations/disparos": typeof mutations_disparos;
  "mutations/empresas": typeof mutations_empresas;
  "mutations/leads": typeof mutations_leads;
  "mutations/profiles": typeof mutations_profiles;
  "mutations/templates": typeof mutations_templates;
  "mutations/whatsappInstances": typeof mutations_whatsappInstances;
  "queries/campanhas": typeof queries_campanhas;
  "queries/conversas": typeof queries_conversas;
  "queries/dashboard": typeof queries_dashboard;
  "queries/disparos": typeof queries_disparos;
  "queries/empresas": typeof queries_empresas;
  "queries/leads": typeof queries_leads;
  "queries/profiles": typeof queries_profiles;
  "queries/templates": typeof queries_templates;
  "queries/whatsappInstances": typeof queries_whatsappInstances;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
