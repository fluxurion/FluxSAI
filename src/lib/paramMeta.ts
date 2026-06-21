import { SMART_EVENTS, SMART_ACTIONS, SMART_TARGETS, type EnumOption, type SmartScriptRow } from './types';

export interface ParamDef {
  label: string;
  index: number;
}

function parseParamLabels(comment: string | undefined): string[] {
  if (!comment) return [];
  const trimmed = comment.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NONE' || trimmed === '' || trimmed.startsWith('WARNING') || trimmed.startsWith('LEGACY') || trimmed.startsWith('Ashamane')) {
    if (trimmed.startsWith('Ashamane')) {
      const after = trimmed.substring(trimmed.indexOf(':') + 1).trim();
      if (after) return after.split(',').map(s => s.trim()).filter(s => s && s.toUpperCase() !== 'NONE');
    }
    return [];
  }
  return trimmed.split(',').map(s => s.trim()).filter(s => s && s.toUpperCase() !== 'NONE');
}

function findEnum(opts: EnumOption[], val: number): EnumOption | undefined {
  return opts.find(o => o.value === val);
}

export function getEventParams(eventType: number): ParamDef[] {
  const opt = findEnum(SMART_EVENTS, eventType);
  const labels = parseParamLabels(opt?.comment);
  return labels.map((label, i) => ({ label, index: i + 1 }));
}

export function getEventParamString(eventType: number): boolean {
  return eventType === 79;
}

export function getActionParams(actionType: number): ParamDef[] {
  const opt = findEnum(SMART_ACTIONS, actionType);
  const labels = parseParamLabels(opt?.comment);
  return labels.map((label, i) => ({ label, index: i + 1 }));
}

export function getTargetParams(targetType: number): ParamDef[] {
  const opt = findEnum(SMART_TARGETS, targetType);
  const labels = parseParamLabels(opt?.comment);
  return labels.map((label, i) => ({ label, index: i + 1 }));
}

export function getTargetHasCoords(targetType: number): boolean {
  return targetType === 8;
}

export function getEventLabel(eventType: number): string {
  return findEnum(SMART_EVENTS, eventType)?.label ?? `#${eventType}`;
}

export function getActionLabel(actionType: number): string {
  return findEnum(SMART_ACTIONS, actionType)?.label ?? `#${actionType}`;
}

export function getTargetLabel(targetType: number): string {
  return findEnum(SMART_TARGETS, targetType)?.label ?? `#${targetType}`;
}

export function generateScriptComment(row: SmartScriptRow): string {
  const eventLabel = getEventLabel(row.event_type);
  const actionLabel = getActionLabel(row.action_type);
  const targetLabel = getTargetLabel(row.target_type);

  const parts: string[] = [];

  // Event condition
  parts.push(`When ${eventLabel}`);

  // Add event params if meaningful
  const evParams = getEventParams(row.event_type);
  if (evParams.length > 0) {
    const paramVals: string[] = [];
    for (const p of evParams) {
      const val = p.index === 1 ? row.event_param1 : p.index === 2 ? row.event_param2 : p.index === 3 ? row.event_param3 : p.index === 4 ? row.event_param4 : row.event_param5;
      if (val !== 0) paramVals.push(`${p.label}=${val}`);
    }
    if (paramVals.length > 0) parts.push(`(${paramVals.join(', ')})`);
  }

  parts.push('->');

  // Action
  parts.push(actionLabel);

  // Add action params if meaningful
  const actParams = getActionParams(row.action_type);
  if (actParams.length > 0) {
    const paramVals: string[] = [];
    for (const p of actParams) {
      const val = p.index === 1 ? row.action_param1 : p.index === 2 ? row.action_param2 : p.index === 3 ? row.action_param3 : p.index === 4 ? row.action_param4 : p.index === 5 ? row.action_param5 : row.action_param6;
      if (val !== 0) paramVals.push(`${p.label}=${val}`);
    }
    if (paramVals.length > 0) parts.push(`(${paramVals.join(', ')})`);
  }

  // Target
  parts.push('on/to');
  parts.push(targetLabel);

  // Add target params if meaningful
  const tgtParams = getTargetParams(row.target_type);
  if (tgtParams.length > 0) {
    const paramVals: string[] = [];
    for (const p of tgtParams) {
      const val = p.index === 1 ? row.target_param1 : p.index === 2 ? row.target_param2 : row.target_param3;
      if (val !== 0) paramVals.push(`${p.label}=${val}`);
    }
    if (paramVals.length > 0) parts.push(`(${paramVals.join(', ')})`);
  }

  // Coords for position target
  if (row.target_x !== 0 || row.target_y !== 0 || row.target_z !== 0) {
    parts.push(`at (${row.target_x}, ${row.target_y}, ${row.target_z})`);
  }

  // Chance if not 100
  if (row.event_chance !== 100) {
    parts.push(`[${row.event_chance}% chance]`);
  }

  // Phase mask
  if (row.event_phase_mask > 0) {
    parts.push(`[phase ${row.event_phase_mask}]`);
  }

  return parts.join(' ');
}

export interface EventGroup {
  key: string;
  eventType: number;
  eventPhaseMask: number;
  eventChance: number;
  eventFlags: number;
  eventParam1: number;
  eventParam2: number;
  eventParam3: number;
  eventParam4: number;
  eventParam5: number;
  eventParamString: string;
  rows: number[];
}

export function groupByEvent(rows: { event_type: number; event_phase_mask: number; event_chance: number; event_flags: number; event_param1: number; event_param2: number; event_param3: number; event_param4: number; event_param5: number; event_param_string: string; eventId?: number }[]): EventGroup[] {
  const groups: EventGroup[] = [];
  const map = new Map<string, EventGroup>();

  rows.forEach((row, idx) => {
    const evId = row.eventId;
    const key = evId !== undefined
      ? `${evId}-${row.event_type}-${row.event_phase_mask}-${row.event_chance}-${row.event_flags}-${row.event_param1}-${row.event_param2}-${row.event_param3}-${row.event_param4}-${row.event_param5}-${row.event_param_string}`
      : `${row.event_type}-${row.event_phase_mask}-${row.event_chance}-${row.event_flags}-${row.event_param1}-${row.event_param2}-${row.event_param3}-${row.event_param4}-${row.event_param5}-${row.event_param_string}`;
    if (!map.has(key)) {
      const g: EventGroup = {
        key,
        eventType: row.event_type,
        eventPhaseMask: row.event_phase_mask,
        eventChance: row.event_chance,
        eventFlags: row.event_flags,
        eventParam1: row.event_param1,
        eventParam2: row.event_param2,
        eventParam3: row.event_param3,
        eventParam4: row.event_param4,
        eventParam5: row.event_param5,
        eventParamString: row.event_param_string,
        rows: [],
      };
      map.set(key, g);
      groups.push(g);
    }
    map.get(key)!.rows.push(idx);
  });

  return groups;
}
