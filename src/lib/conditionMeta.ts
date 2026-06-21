export interface ConditionFieldMeta {
  label: string;
  labelHu: string;
  placeholder?: string;
}

export interface ConditionTypeMeta {
  hasValue1: boolean;
  hasValue2: boolean;
  hasValue3: boolean;
  hasTarget: boolean;
  value1?: ConditionFieldMeta;
  value2?: ConditionFieldMeta;
  value3?: ConditionFieldMeta;
}

const NO_FIELDS: ConditionTypeMeta = { hasValue1: false, hasValue2: false, hasValue3: false, hasTarget: true };

export const CONDITION_META: Record<number, ConditionTypeMeta> = {
  // CONDITION_NONE = 0
  0: { ...NO_FIELDS, hasTarget: false },
  // CONDITION_AURA = 1 — spell_id, effindex, 0
  1: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'Spell ID', labelHu: 'Spell ID' },
    value2: { label: 'Effect Index', labelHu: 'Effekt Index' },
  },
  // CONDITION_ITEM = 2 — item_id, count, bank
  2: {
    hasValue1: true, hasValue2: true, hasValue3: true, hasTarget: true,
    value1: { label: 'Item ID', labelHu: 'Tárgy ID' },
    value2: { label: 'Count', labelHu: 'Mennyiség' },
    value3: { label: 'Include Bank (0/1)', labelHu: 'Bank is (0/1)' },
  },
  // CONDITION_ITEM_EQUIPPED = 3 — item_id, 0, 0
  3: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Item ID', labelHu: 'Tárgy ID' },
  },
  // CONDITION_ZONEID = 4 — zone_id, 0, 0
  4: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Zone ID', labelHu: 'Zóna ID' },
  },
  // CONDITION_REPUTATION_RANK = 5 — faction_id, rankMask, 0
  5: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'Faction ID', labelHu: 'Fakció ID' },
    value2: { label: 'Rank Mask', labelHu: 'Rang Maszk' },
  },
  // CONDITION_TEAM = 6 — player_team, 0, 0
  6: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Team (469=Alliance, 67=Horde)', labelHu: 'Csapat (469=Szövetség, 67=Horda)' },
  },
  // CONDITION_SKILL = 7 — skill_id, skill_value, 0
  7: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'Skill ID', labelHu: 'Szakértelem ID' },
    value2: { label: 'Skill Value', labelHu: 'Szakértelem Érték' },
  },
  // CONDITION_QUESTREWARDED = 8 — quest_id, 0, 0
  8: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Quest ID', labelHu: 'Küldetés ID' },
  },
  // CONDITION_QUESTTAKEN = 9 — quest_id, 0, 0
  9: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Quest ID', labelHu: 'Küldetés ID' },
  },
  // CONDITION_DRUNKENSTATE = 10 — DrunkenState, 0, 0
  10: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Drunken State', labelHu: 'Részegségi Állapot' },
  },
  // CONDITION_WORLD_STATE = 11 — index, value, 0
  11: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'Index', labelHu: 'Index' },
    value2: { label: 'Value', labelHu: 'Érték' },
  },
  // CONDITION_ACTIVE_EVENT = 12 — event_id, 0, 0
  12: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Event ID', labelHu: 'Esemény ID' },
  },
  // CONDITION_INSTANCE_INFO = 13 — entry, data, type
  13: {
    hasValue1: true, hasValue2: true, hasValue3: true, hasTarget: true,
    value1: { label: 'Entry', labelHu: 'Entry' },
    value2: { label: 'Data', labelHu: 'Adat' },
    value3: { label: 'Type (0=Data, 1=GuidData, 2=BossState, 3=Data64)', labelHu: 'Típus (0=Data, 1=GuidData, 2=BossState, 3=Data64)' },
  },
  // CONDITION_QUEST_NONE = 14 — quest_id, 0, 0
  14: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Quest ID', labelHu: 'Küldetés ID' },
  },
  // CONDITION_CLASS = 15 — class, 0, 0
  15: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Class', labelHu: 'Kaszt' },
  },
  // CONDITION_RACE = 16 — race, 0, 0
  16: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Race', labelHu: 'Faj' },
  },
  // CONDITION_ACHIEVEMENT = 17 — achievement_id, 0, 0
  17: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Achievement ID', labelHu: 'Achievement ID' },
  },
  // CONDITION_TITLE = 18 — title id, 0, 0
  18: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Title ID', labelHu: 'Cím ID' },
  },
  // CONDITION_GENDER = 20 — gender, 0, 0
  20: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Gender (0=Male, 1=Female)', labelHu: 'Nem (0=Férfi, 1=Nő)' },
  },
  // CONDITION_UNIT_STATE = 21 — unitState, 0, 0
  21: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Unit State', labelHu: 'Unit State' },
  },
  // CONDITION_MAPID = 22 — map_id, 0, 0
  22: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Map ID', labelHu: 'Térkép ID' },
  },
  // CONDITION_AREAID = 23 — area_id, 0, 0
  23: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Area ID', labelHu: 'Terület ID' },
  },
  // CONDITION_CREATURE_TYPE = 24 — cinfo.type, 0, 0
  24: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Creature Type', labelHu: 'Creature Típus' },
  },
  // CONDITION_SPELL = 25 — spell_id, 0, 0
  25: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Spell ID', labelHu: 'Spell ID' },
  },
  // CONDITION_PHASEID = 26 — phaseid, 0, 0
  26: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Phase ID', labelHu: 'Fázis ID' },
  },
  // CONDITION_LEVEL = 27 — level, ComparisonType, 0
  27: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'Level', labelHu: 'Szint' },
    value2: { label: 'Comparison (0=eq, 1=high, 2=low, 3=eq/high, 4=eq/low)', labelHu: 'Összehasonlítás (0=egyenlő, 1=nagyobb, 2=kisebb, 3=egyenlő/nagyobb, 4=egyenlő/kisebb)' },
  },
  // CONDITION_QUEST_COMPLETE = 28 — quest_id, 0, 0
  28: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Quest ID', labelHu: 'Küldetés ID' },
  },
  // CONDITION_NEAR_CREATURE = 29 — creature entry, distance, dead (0/1)
  29: {
    hasValue1: true, hasValue2: true, hasValue3: true, hasTarget: true,
    value1: { label: 'Creature Entry', labelHu: 'Creature Entry' },
    value2: { label: 'Distance', labelHu: 'Távolság' },
    value3: { label: 'Dead (0/1)', labelHu: 'Halott (0/1)' },
  },
  // CONDITION_NEAR_GAMEOBJECT = 30 — gameobject entry, distance, 0
  30: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'GameObject Entry', labelHu: 'GameObject Entry' },
    value2: { label: 'Distance', labelHu: 'Távolság' },
  },
  // CONDITION_OBJECT_ENTRY_GUID_LEGACY = 31 — LEGACY_TypeID, entry, guid
  31: {
    hasValue1: true, hasValue2: true, hasValue3: true, hasTarget: true,
    value1: { label: 'Type ID (Legacy)', labelHu: 'Type ID (Legacy)' },
    value2: { label: 'Entry', labelHu: 'Entry' },
    value3: { label: 'GUID', labelHu: 'GUID' },
  },
  // CONDITION_TYPE_MASK_LEGACY = 32 — LEGACY_TypeMask, 0, 0
  32: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Type Mask (Legacy)', labelHu: 'Type Maszk (Legacy)' },
  },
  // CONDITION_RELATION_TO = 33 — ConditionTarget, RelationType, 0
  33: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: false,
    value1: { label: 'Condition Target (0-2)', labelHu: 'Condition Target (0-2)' },
    value2: { label: 'Relation Type (0=Self, 1=Party, 2=Raid, 3=OwnedBy, 4=PassengerOf, 5=CreatedBy)', labelHu: 'Kapcsolat Típus (0=Saját, 1=Party, 2=Raid, 3=Tulajdonos, 4=Utas, 5=Létrehozó)' },
  },
  // CONDITION_REACTION_TO = 34 — ConditionTarget, rankMask, 0
  34: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: false,
    value1: { label: 'Condition Target (0-2)', labelHu: 'Condition Target (0-2)' },
    value2: { label: 'Rank Mask', labelHu: 'Rang Maszk' },
  },
  // CONDITION_DISTANCE_TO = 35 — ConditionTarget, distance, ComparisonType
  35: {
    hasValue1: true, hasValue2: true, hasValue3: true, hasTarget: false,
    value1: { label: 'Condition Target (0-2)', labelHu: 'Condition Target (0-2)' },
    value2: { label: 'Distance', labelHu: 'Távolság' },
    value3: { label: 'Comparison (0=eq, 1=high, 2=low, 3=eq/high, 4=eq/low)', labelHu: 'Összehasonlítás (0=egyenlő, 1=nagyobb, 2=kisebb, 3=egyenlő/nagyobb, 4=egyenlő/kisebb)' },
  },
  // CONDITION_ALIVE = 36 — 0, 0, 0
  36: { ...NO_FIELDS },
  // CONDITION_HP_VAL = 37 — hpVal, ComparisonType, 0
  37: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'HP Value', labelHu: 'HP Érték' },
    value2: { label: 'Comparison (0=eq, 1=high, 2=low, 3=eq/high, 4=eq/low)', labelHu: 'Összehasonlítás (0=egyenlő, 1=nagyobb, 2=kisebb, 3=egyenlő/nagyobb, 4=egyenlő/kisebb)' },
  },
  // CONDITION_HP_PCT = 38 — hpPct, ComparisonType, 0
  38: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'HP %', labelHu: 'HP %' },
    value2: { label: 'Comparison (0=eq, 1=high, 2=low, 3=eq/high, 4=eq/low)', labelHu: 'Összehasonlítás (0=egyenlő, 1=nagyobb, 2=kisebb, 3=egyenlő/nagyobb, 4=egyenlő/kisebb)' },
  },
  // CONDITION_REALM_ACHIEVEMENT = 39 — achievement_id, 0, 0
  39: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Achievement ID', labelHu: 'Achievement ID' },
  },
  // CONDITION_IN_WATER = 40 — 0, 0, 0
  40: { ...NO_FIELDS },
  // CONDITION_TERRAIN_SWAP = 41 — terrainSwap, 0, 0
  41: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Terrain Swap', labelHu: 'Terrain Swap' },
  },
  // CONDITION_STAND_STATE = 42 — stateType, state, 0
  42: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'State Type (0=exact, 1=any standing, 1=any sitting)', labelHu: 'Állapot Típus (0=pontos, 1=álló, 1=ülő)' },
    value2: { label: 'State', labelHu: 'Állapot' },
  },
  // CONDITION_DAILY_QUEST_DONE = 43 — quest id, 0, 0
  43: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Quest ID', labelHu: 'Küldetés ID' },
  },
  // CONDITION_CHARMED = 44 — 0, 0, 0
  44: { ...NO_FIELDS },
  // CONDITION_PET_TYPE = 45 — mask, 0, 0
  45: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Pet Type Mask', labelHu: 'Pet Típus Maszk' },
  },
  // CONDITION_TAXI = 46 — 0, 0, 0
  46: { ...NO_FIELDS },
  // CONDITION_QUESTSTATE = 47 — quest_id, state_mask, 0
  47: {
    hasValue1: true, hasValue2: true, hasValue3: false, hasTarget: true,
    value1: { label: 'Quest ID', labelHu: 'Küldetés ID' },
    value2: { label: 'State Mask (1=not taken, 2=completed, 8=in progress, 32=failed, 64=rewarded)', labelHu: 'Állapot Maszk (1=nem felvett, 2=complete, 8=folyamatban, 32=sikertelen, 64=jutalmazott)' },
  },
  // CONDITION_QUEST_OBJECTIVE_COMPLETE = 48 — ID, 0, 0
  48: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Objective ID', labelHu: 'Cél ID' },
  },
  // CONDITION_DIFFICULTY_ID = 49 — Difficulty, 0, 0
  49: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Difficulty ID', labelHu: 'Nehézség ID' },
  },
  // CONDITION_OBJECT_ENTRY_GUID = 51 — TypeID, entry, guid
  51: {
    hasValue1: true, hasValue2: true, hasValue3: true, hasTarget: true,
    value1: { label: 'Type ID', labelHu: 'Type ID' },
    value2: { label: 'Entry (0=any)', labelHu: 'Entry (0=bármilyen)' },
    value3: { label: 'GUID (0=any)', labelHu: 'GUID (0=bármilyen)' },
  },
  // CONDITION_TYPE_MASK = 52 — TypeMask, 0, 0
  52: {
    hasValue1: true, hasValue2: false, hasValue3: false, hasTarget: true,
    value1: { label: 'Type Mask', labelHu: 'Type Maszk' },
  },
};

export function getConditionMeta(type: number): ConditionTypeMeta {
  return CONDITION_META[type] ?? { hasValue1: true, hasValue2: true, hasValue3: true, hasTarget: true };
}
