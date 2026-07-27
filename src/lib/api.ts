import { invoke } from '@tauri-apps/api/core';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface SmartScriptRow {
  entryorguid: number;
  source_type: number;
  id: number;
  link: number;
  event_type: number;
  event_phase_mask: number;
  event_chance: number;
  event_flags: number;
  event_param1: number;
  event_param2: number;
  event_param3: number;
  event_param4: number;
  event_param5: number;
  event_param_string: string;
  action_type: number;
  action_param1: number;
  action_param2: number;
  action_param3: number;
  action_param4: number;
  action_param5: number;
  action_param6: number;
  target_type: number;
  target_param1: number;
  target_param2: number;
  target_param3: number;
  target_x: number;
  target_y: number;
  target_z: number;
  target_o: number;
  comment: string;
  eventId?: number;
}

export interface ConditionRow {
  SourceTypeOrReferenceId: number;
  SourceGroup: number;
  SourceEntry: number;
  SourceId: number;
  ElseGroup: number;
  ConditionTypeOrReference: number;
  ConditionTarget: number;
  ConditionValue1: number;
  ConditionValue2: number;
  ConditionValue3: number;
  NegativeCondition: boolean;
  ErrorType: number;
  ErrorTextId: number;
  ScriptName: string;
}

export async function connectDb(config: DbConfig): Promise<string> {
  return invoke('connect_db', { config });
}

export async function disconnectDb(): Promise<string> {
  return invoke('disconnect_db');
}

export async function testConnection(config: DbConfig): Promise<string> {
  return invoke('test_connection', { config });
}

export async function fetchScripts(entryorguid?: number, sourceType?: number): Promise<SmartScriptRow[]> {
  return invoke('fetch_scripts', { entryorguid, sourceType });
}

export async function fetchScriptByEntry(entryorguid: number, sourceType: number): Promise<SmartScriptRow[]> {
  return invoke('fetch_script_by_entry', { entryorguid, sourceType });
}

export interface TemplateEntry {
  entry: number;
  name: string;
}

export interface NameSearchResult {
  entries: TemplateEntry[];
  scripts: SmartScriptRow[];
}

export async function searchScriptsByName(name: string, sourceType: number): Promise<NameSearchResult> {
  return invoke('search_scripts_by_name', { name, sourceType });
}

export async function searchScriptsByActionOrEvent(
  searchField: 'action' | 'event',
  value: number,
  sourceType: number,
): Promise<NameSearchResult> {
  return invoke('search_scripts_by_action_or_event', { searchField, value, sourceType });
}

export async function insertScript(row: SmartScriptRow): Promise<string> {
  return invoke('insert_script', { row });
}

export async function deleteScript(entryorguid: number, sourceType: number, id: number): Promise<string> {
  return invoke('delete_script', { entryorguid, sourceType, id });
}

export async function fetchConditions(sourceEntry: number, sourceId: number): Promise<ConditionRow[]> {
  return invoke('fetch_conditions', { sourceEntry, sourceId });
}

export async function fetchAllConditionsForEntry(sourceEntry: number): Promise<ConditionRow[]> {
  return invoke('fetch_all_conditions_for_entry', { sourceEntry });
}

export async function insertCondition(row: ConditionRow): Promise<string> {
  return invoke('insert_condition', { row });
}

export async function deleteConditionsForSmartEvent(sourceEntry: number, sourceId: number): Promise<string> {
  return invoke('delete_conditions_for_smart_event', { sourceEntry, sourceId });
}

export async function saveEntryToFile(rows: SmartScriptRow[], conditions: ConditionRow[]): Promise<string> {
  return invoke('save_entry_to_file', { rows, conditions });
}

export async function exportScriptsSql(rows: SmartScriptRow[], conditions: ConditionRow[] = []): Promise<string> {
  return invoke('export_scripts_sql', { rows, conditions });
}

export interface CreatureTemplateInfo {
  entry: number;
  name: string;
  ainame: string;
  scriptname: string;
}

export async function fetchCreatureTemplateInfo(entry: number): Promise<CreatureTemplateInfo | null> {
  return invoke('fetch_creature_template_info', { entry });
}
