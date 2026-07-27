export type SmartScriptType =
  | 0 // Creature
  | 1 // GameObject
  | 2 // AreaTrigger
  | 3 // Event
  | 4 // Gossip
  | 5 // Quest
  | 6 // Spell
  | 7 // Transport
  | 8 // Instance
  | 9 // TimedActionlist
  | 10; // Scene

export interface SmartScriptTypeOption {
  value: SmartScriptType;
  label: string;
}

export const SMART_SCRIPT_TYPES: SmartScriptTypeOption[] = [
  { value: 0, label: 'Creature' },
  { value: 1, label: 'GameObject' },
  { value: 2, label: 'AreaTrigger' },
  { value: 3, label: 'Event' },
  { value: 4, label: 'Gossip' },
  { value: 5, label: 'Quest' },
  { value: 6, label: 'Spell' },
  { value: 7, label: 'Transport' },
  { value: 8, label: 'Instance' },
  { value: 9, label: 'Timed Actionlist' },
  { value: 10, label: 'Scene' },
];

export interface EnumOption {
  value: number;
  label: string;
  comment?: string;
}

export const SMART_EVENTS: EnumOption[] = [
  { value: 0, label: 'UPDATE_IC', comment: 'InitialMin, InitialMax, RepeatMin, RepeatMax' },
  { value: 1, label: 'UPDATE_OOC', comment: 'InitialMin, InitialMax, RepeatMin, RepeatMax' },
  { value: 2, label: 'HEALT_PCT', comment: 'HPMin%, HPMax%, RepeatMin, RepeatMax' },
  { value: 3, label: 'MANA_PCT', comment: 'ManaMin%, ManaMax%, RepeatMin, RepeatMax' },
  { value: 4, label: 'AGGRO', comment: 'NONE' },
  { value: 5, label: 'KILL', comment: 'CooldownMin, CooldownMax, playerOnly, creatureEntry' },
  { value: 6, label: 'DEATH', comment: 'NONE' },
  { value: 7, label: 'EVADE', comment: 'NONE' },
  { value: 8, label: 'SPELLHIT', comment: 'SpellID, School, CooldownMin, CooldownMax' },
  { value: 9, label: 'RANGE', comment: 'MinDist, MaxDist, RepeatMin, RepeatMax' },
  { value: 10, label: 'OOC_LOS', comment: 'NoHostile, MaxDist, CooldownMin, CooldownMax' },
  { value: 11, label: 'RESPAWN', comment: 'type, MapId, ZoneId' },
  { value: 12, label: 'TARGET_HEALTH_PCT', comment: 'HPMin%, HPMax%, RepeatMin, RepeatMax' },
  { value: 13, label: 'VICTIM_CASTING', comment: 'RepeatMin, RepeatMax, spellid' },
  { value: 14, label: 'FRIENDLY_HEALTH', comment: 'HPDeficit, Radius, RepeatMin, RepeatMax' },
  { value: 15, label: 'FRIENDLY_IS_CC', comment: 'Radius, RepeatMin, RepeatMax' },
  { value: 16, label: 'FRIENDLY_MISSING_BUFF', comment: 'SpellId, Radius, RepeatMin, RepeatMax' },
  { value: 17, label: 'SUMMONED_UNIT', comment: 'CreatureId, CooldownMin, CooldownMax' },
  { value: 18, label: 'TARGET_MANA_PCT', comment: 'ManaMin%, ManaMax%, RepeatMin, RepeatMax' },
  { value: 19, label: 'ACCEPTED_QUEST', comment: 'QuestID' },
  { value: 20, label: 'REWARD_QUEST', comment: 'QuestID' },
  { value: 21, label: 'REACHED_HOME', comment: 'NONE' },
  { value: 22, label: 'RECEIVE_EMOTE', comment: 'EmoteId, CooldownMin, CooldownMax, condition, val1, val2, val3' },
  { value: 23, label: 'HAS_AURA', comment: 'SpellID, Stack, RepeatMin, RepeatMax' },
  { value: 24, label: 'TARGET_BUFFED', comment: 'SpellID, Stack, RepeatMin, RepeatMax' },
  { value: 25, label: 'RESET', comment: 'NONE' },
  { value: 26, label: 'IC_LOS', comment: 'NoHostile, MaxDist, CooldownMin, CooldownMax' },
  { value: 27, label: 'PASSENGER_BOARDED', comment: 'CooldownMin, CooldownMax' },
  { value: 28, label: 'PASSENGER_REMOVED', comment: 'CooldownMin, CooldownMax' },
  { value: 29, label: 'CHARMED', comment: 'onRemove (0=apply, 1=remove)' },
  { value: 30, label: 'CHARMED_TARGET', comment: 'NONE' },
  { value: 31, label: 'SPELLHIT_TARGET', comment: 'SpellID, School, CooldownMin, CooldownMax' },
  { value: 32, label: 'DAMAGED', comment: 'MinDmg, MaxDmg, CooldownMin, CooldownMax' },
  { value: 33, label: 'DAMAGED_TARGET', comment: 'MinDmg, MaxDmg, CooldownMin, CooldownMax' },
  { value: 34, label: 'MOVEMENTINFORM', comment: 'MovementType, PointID' },
  { value: 35, label: 'SUMMON_DESPAWNED', comment: 'Entry, CooldownMin, CooldownMax' },
  { value: 36, label: 'CORPSE_REMOVED', comment: 'NONE' },
  { value: 37, label: 'AI_INIT', comment: 'NONE' },
  { value: 38, label: 'DATA_SET', comment: 'Id, Value, CooldownMin, CooldownMax' },
  { value: 39, label: 'WAYPOINT_START', comment: 'PointId, pathID' },
  { value: 40, label: 'WAYPOINT_REACHED', comment: 'PointId, pathID' },
  { value: 41, label: 'TRANSPORT_ADDPLAYER', comment: 'NONE' },
  { value: 42, label: 'TRANSPORT_ADDCREATURE', comment: 'Entry' },
  { value: 43, label: 'TRANSPORT_REMOVE_PLAYER', comment: 'NONE' },
  { value: 44, label: 'TRANSPORT_RELOCATE', comment: 'PointId' },
  { value: 45, label: 'INSTANCE_PLAYER_ENTER', comment: 'Team, CooldownMin, CooldownMax' },
  { value: 46, label: 'AREATRIGGER_ONTRIGGER', comment: 'TriggerId' },
  { value: 47, label: 'QUEST_ACCEPTED', comment: 'NONE' },
  { value: 48, label: 'QUEST_OBJ_COPLETETION', comment: 'NONE' },
  { value: 49, label: 'QUEST_COMPLETION', comment: 'NONE' },
  { value: 50, label: 'QUEST_REWARDED', comment: 'NONE' },
  { value: 51, label: 'QUEST_FAIL', comment: 'NONE' },
  { value: 52, label: 'TEXT_OVER', comment: 'GroupId, creatureEntry' },
  { value: 53, label: 'RECEIVE_HEAL', comment: 'MinHeal, MaxHeal, CooldownMin, CooldownMax' },
  { value: 54, label: 'JUST_SUMMONED', comment: 'NONE' },
  { value: 55, label: 'WAYPOINT_PAUSED', comment: 'PointId, pathID' },
  { value: 56, label: 'WAYPOINT_RESUMED', comment: 'PointId, pathID' },
  { value: 57, label: 'WAYPOINT_STOPPED', comment: 'PointId, pathID' },
  { value: 58, label: 'WAYPOINT_ENDED', comment: 'PointId, pathID' },
  { value: 59, label: 'TIMED_EVENT_TRIGGERED', comment: 'id' },
  { value: 60, label: 'UPDATE', comment: 'InitialMin, InitialMax, RepeatMin, RepeatMax' },
  { value: 61, label: 'LINK', comment: 'INTERNAL - links events together' },
  { value: 62, label: 'GOSSIP_SELECT', comment: 'menuID, actionID' },
  { value: 63, label: 'JUST_CREATED', comment: 'NONE' },
  { value: 64, label: 'GOSSIP_HELLO', comment: 'noReportUse (for GOs)' },
  { value: 65, label: 'FOLLOW_COMPLETED', comment: 'NONE' },
  { value: 66, label: 'DUMMY_EFFECT', comment: 'spellId, effectIndex' },
  { value: 67, label: 'IS_BEHIND_TARGET', comment: 'CooldownMin, CooldownMax' },
  { value: 68, label: 'GAME_EVENT_START', comment: 'game_event.Entry' },
  { value: 69, label: 'GAME_EVENT_END', comment: 'game_event.Entry' },
  { value: 70, label: 'GO_STATE_CHANGED', comment: 'go state' },
  { value: 71, label: 'GO_EVENT_INFORM', comment: 'eventId' },
  { value: 72, label: 'ACTION_DONE', comment: 'eventId' },
  { value: 73, label: 'ON_SPELLCLICK', comment: 'clicker' },
  { value: 74, label: 'FRIENDLY_HEALTH_PCT', comment: 'minHpPct, maxHpPct, RepeatMin, RepeatMax' },
  { value: 75, label: 'DISTANCE_CREATURE', comment: 'guid, entry, distance, repeat' },
  { value: 76, label: 'DISTANCE_GAMEOBJECT', comment: 'guid, entry, distance, repeat' },
  { value: 77, label: 'COUNTER_SET', comment: 'id, value, CooldownMin, CooldownMax' },
  { value: 78, label: 'SCENE_START', comment: 'NONE' },
  { value: 79, label: 'SCENE_TRIGGER', comment: 'triggerName (param_string)' },
  { value: 80, label: 'SCENE_CANCEL', comment: 'NONE' },
  { value: 81, label: 'SCENE_COMPLETE', comment: 'NONE' },
];

export const SMART_ACTIONS: EnumOption[] = [
  { value: 0, label: 'NONE', comment: 'No action' },
  { value: 1, label: 'TALK', comment: 'groupID, duration, useTalkTarget' },
  { value: 2, label: 'SET_FACTION', comment: 'FactionId' },
  { value: 3, label: 'MORPH_TO_ENTRY_OR_MODEL', comment: 'CreatureEntry OR ModelId' },
  { value: 4, label: 'SOUND', comment: 'SoundId, onlySelf' },
  { value: 5, label: 'PLAY_EMOTE', comment: 'EmoteId' },
  { value: 6, label: 'FAIL_QUEST', comment: 'QuestID' },
  { value: 7, label: 'OFFER_QUEST', comment: 'QuestID, directAdd' },
  { value: 8, label: 'SET_REACT_STATE', comment: 'state' },
  { value: 9, label: 'ACTIVATE_GOBJECT', comment: '' },
  { value: 10, label: 'RANDOM_EMOTE', comment: 'EmoteId1..6' },
  { value: 11, label: 'CAST', comment: 'SpellId, CastFlags, TriggeredFlags, targetsLimit' },
  { value: 12, label: 'SUMMON_CREATURE', comment: 'CreatureID, summonType, duration, attackInvoker, data' },
  { value: 13, label: 'THREAT_SINGLE_PCT', comment: 'Threat%' },
  { value: 14, label: 'THREAT_ALL_PCT', comment: 'Threat%' },
  { value: 15, label: 'CALL_AREAEXPLOREDOREVENTHAPPENS', comment: 'QuestID' },
  { value: 16, label: 'SET_INGAME_PHASE_GROUP', comment: 'phaseGroupId, apply' },
  { value: 17, label: 'SET_EMOTE_STATE', comment: 'emoteID' },
  { value: 18, label: 'SET_UNIT_FLAG', comment: 'Flags, Target' },
  { value: 19, label: 'REMOVE_UNIT_FLAG', comment: 'Flags, Target' },
  { value: 20, label: 'AUTO_ATTACK', comment: 'AllowAttackState' },
  { value: 21, label: 'ALLOW_COMBAT_MOVEMENT', comment: 'AllowCombatMovement' },
  { value: 22, label: 'SET_EVENT_PHASE', comment: 'Phase' },
  { value: 23, label: 'INC_EVENT_PHASE', comment: 'Value (negative to decrement)' },
  { value: 24, label: 'EVADE', comment: '' },
  { value: 25, label: 'FLEE_FOR_ASSIST', comment: 'With Emote' },
  { value: 26, label: 'CALL_GROUPEVENTHAPPENS', comment: 'QuestID' },
  { value: 27, label: 'COMBAT_STOP', comment: '' },
  { value: 28, label: 'REMOVEAURASFROMSPELL', comment: 'Spellid, charges' },
  { value: 29, label: 'FOLLOW', comment: 'Distance, Angle, EndCreatureEntry, credit, creditType' },
  { value: 30, label: 'RANDOM_PHASE', comment: 'PhaseId1..6' },
  { value: 31, label: 'RANDOM_PHASE_RANGE', comment: 'PhaseMin, PhaseMax' },
  { value: 32, label: 'RESET_GOBJECT', comment: '' },
  { value: 33, label: 'CALL_KILLEDMONSTER', comment: 'CreatureId' },
  { value: 34, label: 'SET_INST_DATA', comment: 'Field, Data, Type' },
  { value: 35, label: 'SET_INST_DATA64', comment: 'Field' },
  { value: 36, label: 'UPDATE_TEMPLATE', comment: 'Entry' },
  { value: 37, label: 'DIE', comment: '' },
  { value: 38, label: 'SET_IN_COMBAT_WITH_ZONE', comment: '' },
  { value: 39, label: 'CALL_FOR_HELP', comment: 'Radius, With Emote' },
  { value: 40, label: 'SET_SHEATH', comment: 'Sheath (0=unarmed, 1=melee, 2=ranged)' },
  { value: 41, label: 'FORCE_DESPAWN', comment: 'timer' },
  { value: 42, label: 'SET_INVINCIBILITY_HP_LEVEL', comment: 'MinHpValue' },
  { value: 43, label: 'MOUNT_TO_ENTRY_OR_MODEL', comment: 'CreatureEntry OR ModelId' },
  { value: 44, label: 'SET_INGAME_PHASE_ID', comment: 'PhaseId, apply' },
  { value: 45, label: 'SET_DATA', comment: 'Field, Data' },
  { value: 47, label: 'SET_VISIBILITY', comment: 'on/off' },
  { value: 48, label: 'SET_ACTIVE', comment: 'on/off' },
  { value: 49, label: 'ATTACK_START', comment: '' },
  { value: 50, label: 'SUMMON_GO', comment: 'GameObjectID, DespawnTime' },
  { value: 51, label: 'KILL_UNIT', comment: '' },
  { value: 52, label: 'ACTIVATE_TAXI', comment: 'TaxiID' },
  { value: 53, label: 'WP_START', comment: 'run/walk, pathID, repeat, quest, despawntime, reactState' },
  { value: 54, label: 'WP_PAUSE', comment: 'time' },
  { value: 55, label: 'WP_STOP', comment: 'despawnTime, quest, fail' },
  { value: 56, label: 'ADD_ITEM', comment: 'itemID, count' },
  { value: 57, label: 'REMOVE_ITEM', comment: 'itemID, count' },
  { value: 58, label: 'INSTALL_AI_TEMPLATE', comment: 'AITemplateID' },
  { value: 59, label: 'SET_RUN', comment: '0/1' },
  { value: 60, label: 'SET_DISABLE_GRAVITY', comment: '0/1' },
  { value: 61, label: 'SET_SWIM', comment: '0/1' },
  { value: 62, label: 'TELEPORT', comment: 'mapID' },
  { value: 63, label: 'SET_COUNTER', comment: 'id, value, reset' },
  { value: 64, label: 'STORE_TARGET_LIST', comment: 'varID' },
  { value: 65, label: 'WP_RESUME', comment: '' },
  { value: 66, label: 'SET_ORIENTATION', comment: '' },
  { value: 67, label: 'CREATE_TIMED_EVENT', comment: 'id, InitialMin, InitialMax, RepeatMin, RepeatMax, chance' },
  { value: 68, label: 'PLAYMOVIE', comment: 'entry' },
  { value: 69, label: 'MOVE_TO_POS', comment: 'PointId, transport, disablePathfinding, ContactDistance' },
  { value: 70, label: 'RESPAWN_TARGET', comment: '' },
  { value: 71, label: 'EQUIP', comment: 'entry, slotmask, slot1, slot2, slot3' },
  { value: 72, label: 'CLOSE_GOSSIP', comment: '' },
  { value: 73, label: 'TRIGGER_TIMED_EVENT', comment: 'id' },
  { value: 74, label: 'REMOVE_TIMED_EVENT', comment: 'id' },
  { value: 75, label: 'ADD_AURA', comment: 'spellid' },
  { value: 76, label: 'OVERRIDE_SCRIPT_BASE_OBJECT', comment: 'WARNING: CAN CRASH' },
  { value: 77, label: 'RESET_SCRIPT_BASE_OBJECT', comment: '' },
  { value: 78, label: 'CALL_SCRIPT_RESET', comment: '' },
  { value: 79, label: 'SET_RANGED_MOVEMENT', comment: 'Distance, angle' },
  { value: 80, label: 'CALL_TIMED_ACTIONLIST', comment: 'ID, stopAfterCombat, timerUpdateType' },
  { value: 81, label: 'SET_NPC_FLAG', comment: 'Flags' },
  { value: 82, label: 'ADD_NPC_FLAG', comment: 'Flags' },
  { value: 83, label: 'REMOVE_NPC_FLAG', comment: 'Flags' },
  { value: 84, label: 'SIMPLE_TALK', comment: 'groupID' },
  { value: 85, label: 'INVOKER_CAST', comment: 'spellID, castFlags' },
  { value: 86, label: 'CROSS_CAST', comment: 'spellID, castFlags, CasterTargetType, params' },
  { value: 87, label: 'CALL_RANDOM_TIMED_ACTIONLIST', comment: 'script9 ids 1-9' },
  { value: 88, label: 'CALL_RANDOM_RANGE_TIMED_ACTIONLIST', comment: 'script9 id min, max' },
  { value: 89, label: 'RANDOM_MOVE', comment: 'maxDist' },
  { value: 90, label: 'SET_UNIT_FIELD_BYTES_1', comment: 'bytes, target' },
  { value: 91, label: 'REMOVE_UNIT_FIELD_BYTES_1', comment: 'bytes, target' },
  { value: 92, label: 'INTERRUPT_SPELL', comment: '' },
  { value: 93, label: 'SEND_GO_CUSTOM_ANIM', comment: 'anim id' },
  { value: 94, label: 'SET_DYNAMIC_FLAG', comment: 'Flags' },
  { value: 95, label: 'ADD_DYNAMIC_FLAG', comment: 'Flags' },
  { value: 96, label: 'REMOVE_DYNAMIC_FLAG', comment: 'Flags' },
  { value: 97, label: 'JUMP_TO_POS', comment: 'speedXY, speedZ, targetX, targetY, targetZ' },
  { value: 98, label: 'SEND_GOSSIP_MENU', comment: 'menuId, optionIndex' },
  { value: 99, label: 'GO_SET_LOOT_STATE', comment: 'state' },
  { value: 100, label: 'SEND_TARGET_TO_TARGET', comment: 'id' },
  { value: 101, label: 'SET_HOME_POS', comment: '' },
  { value: 102, label: 'SET_HEALTH_REGEN', comment: '0/1' },
  { value: 103, label: 'SET_ROOT', comment: 'off/on' },
  { value: 104, label: 'SET_GO_FLAG', comment: 'Flags' },
  { value: 105, label: 'ADD_GO_FLAG', comment: 'Flags' },
  { value: 106, label: 'REMOVE_GO_FLAG', comment: 'Flags' },
  { value: 107, label: 'SUMMON_CREATURE_GROUP', comment: 'Group, attackInvoker' },
  { value: 108, label: 'SET_POWER', comment: 'PowerType, newPower' },
  { value: 109, label: 'ADD_POWER', comment: 'PowerType, newPower' },
  { value: 110, label: 'REMOVE_POWER', comment: 'PowerType, newPower' },
  { value: 111, label: 'GAME_EVENT_STOP', comment: 'GameEventId' },
  { value: 112, label: 'GAME_EVENT_START', comment: 'GameEventId' },
  { value: 113, label: 'START_CLOSEST_WAYPOINT', comment: 'wp1..wp7' },
  { value: 114, label: 'MOVE_OFFSET', comment: '' },
  { value: 115, label: 'RANDOM_SOUND', comment: 'soundId1..5, onlySelf' },
  { value: 116, label: 'SET_CORPSE_DELAY', comment: 'timer' },
  { value: 117, label: 'DISABLE_EVADE', comment: '0/1' },
  { value: 118, label: 'GO_SET_GO_STATE', comment: 'state' },
  { value: 119, label: 'SET_CAN_FLY', comment: '0/1' },
  { value: 120, label: 'REMOVE_AURAS_BY_TYPE', comment: 'type' },
  { value: 121, label: 'SET_SIGHT_DIST', comment: 'sightDistance' },
  { value: 122, label: 'FLEE', comment: 'fleeTime' },
  { value: 123, label: 'ADD_THREAT', comment: '+threat, -threat' },
  { value: 124, label: 'LOAD_EQUIPMENT', comment: 'id' },
  { value: 125, label: 'TRIGGER_RANDOM_TIMED_EVENT', comment: 'id min range, id max range' },
  { value: 126, label: 'REMOVE_ALL_GAMEOBJECTS', comment: '' },
  { value: 127, label: 'STOP_MOTION', comment: 'stopMoving, movementExpired' },
  { value: 128, label: 'PLAY_ANIMKIT', comment: 'id, type' },
  { value: 129, label: 'SCENE_PLAY', comment: 'sceneId' },
  { value: 130, label: 'SCENE_CANCEL', comment: 'sceneId' },
  { value: 135, label: 'PLAY_CINEMATIC', comment: 'reserved' },
  { value: 136, label: 'SET_MOVEMENT_SPEED', comment: 'movementType, speedInteger, speedFraction' },
  { value: 137, label: 'PLAY_SPELL_VISUAL_KIT', comment: 'spellVisualKitId, kitType, duration' },
  { value: 138, label: 'FORCE_COMPLETE_QUEST', comment: 'quest Id' },
  { value: 139, label: 'SAY', comment: 'type(0=Say, 1=Yell), broadcastTextId, duration, target' },
  { value: 140, label: 'GET_SCENARIO', comment: 'scenario Id' },
  { value: 141, label: 'COMPLETE_SCENARIO_STEP', comment: 'complete a scenario step' },
  { value: 142, label: 'COMPLETE_SCENARIO', comment: 'complete full scenario' },
  { value: 201, label: 'PLAY_SPELL_VISUAL', comment: 'Ashamane: id, travelSpeed, target type variation' },
  { value: 202, label: 'PLAY_ORPHAN_SPELL_VISUAL', comment: 'Ashamane: id, travelSpeed, target type variation' },
  { value: 203, label: 'CANCEL_VISUAL', comment: 'Ashamane: VisualType, VisualId' },
  { value: 204, label: 'CIRCLE_PATH', comment: 'Ashamane: Radius, Clockwise, StepCount' },
  { value: 205, label: 'SET_OVERRIDE_ZONE_LIGHT', comment: 'Ashamane: zoneId, lightId, timer(ms)' },
  { value: 206, label: 'START_CONVERSATION', comment: 'Ashamane: conversationId' },
  { value: 207, label: 'MODIFY_THREAT', comment: 'Ashamane: increase, decrease' },
  { value: 208, label: 'SET_SPEED', comment: 'Ashamane: speedType, speed' },
  { value: 209, label: 'IGNORE_PATHFINDING', comment: 'Ashamane: 0/1' },
  { value: 210, label: 'SET_OVERRIDE_ZONE_MUSIC', comment: 'Ashamane: zoneId, musicId' },
  { value: 211, label: 'SET_POWER_TYPE', comment: 'Ashamane: Power Type' },
  { value: 212, label: 'SET_MAX_POWER', comment: 'Ashamane: Power Type, value' },
  { value: 213, label: 'ADD_FLYING_MOVEMENT_FLAG', comment: 'Ashamane: Variation' },
  { value: 214, label: 'REMOVE_FLYING_MOVEMENT_FLAG', comment: 'Ashamane: Variation' },
  { value: 215, label: 'CAST_SPELL_OFFSET', comment: 'Ashamane: SpellId, triggered if value=1' },
  { value: 1005, label: 'ENTER_LFG_QUEUE', comment: 'BfaCore: DungeonID, RoleMask' },
];

export const SMART_TARGETS: EnumOption[] = [
  { value: 0, label: 'NONE', comment: 'defaulting to invoker' },
  { value: 1, label: 'SELF', comment: 'Self cast' },
  { value: 2, label: 'VICTIM', comment: 'Current target (highest aggro)' },
  { value: 3, label: 'HOSTILE_SECOND_AGGRO', comment: 'Second highest aggro, maxdist, playerOnly, powerType+1' },
  { value: 4, label: 'HOSTILE_LAST_AGGRO', comment: 'Dead last on aggro, maxdist, playerOnly, powerType+1' },
  { value: 5, label: 'HOSTILE_RANDOM', comment: 'Random target on threat list, maxdist, playerOnly, powerType+1' },
  { value: 6, label: 'HOSTILE_RANDOM_NOT_TOP', comment: 'Random except top threat, maxdist, playerOnly, powerType+1' },
  { value: 7, label: 'ACTION_INVOKER', comment: 'Unit who caused this Event' },
  { value: 8, label: 'POSITION', comment: 'use xyz from event params' },
  { value: 9, label: 'CREATURE_RANGE', comment: 'CreatureEntry, minDist, maxDist' },
  { value: 10, label: 'CREATURE_GUID', comment: 'guid, entry' },
  { value: 11, label: 'CREATURE_DISTANCE', comment: 'CreatureEntry, maxDist' },
  { value: 12, label: 'STORED', comment: 'id, pre-stored target(list)' },
  { value: 13, label: 'GAMEOBJECT_RANGE', comment: 'entry, min, max' },
  { value: 14, label: 'GAMEOBJECT_GUID', comment: 'guid, entry' },
  { value: 15, label: 'GAMEOBJECT_DISTANCE', comment: 'entry, maxDist' },
  { value: 16, label: 'INVOKER_PARTY', comment: 'invoker party members' },
  { value: 17, label: 'PLAYER_RANGE', comment: 'min, max' },
  { value: 18, label: 'PLAYER_DISTANCE', comment: 'maxDist' },
  { value: 19, label: 'CLOSEST_CREATURE', comment: 'CreatureEntry, maxDist, dead?' },
  { value: 20, label: 'CLOSEST_GAMEOBJECT', comment: 'entry, maxDist' },
  { value: 21, label: 'CLOSEST_PLAYER', comment: 'maxDist' },
  { value: 22, label: 'ACTION_INVOKER_VEHICLE', comment: 'Unit vehicle who caused Event' },
  { value: 23, label: 'OWNER_OR_SUMMONER', comment: 'Unit owner or summoner' },
  { value: 24, label: 'THREAT_LIST', comment: 'All units on threat list, maxdist' },
  { value: 25, label: 'CLOSEST_ENEMY', comment: 'maxDist, playerOnly' },
  { value: 26, label: 'CLOSEST_FRIENDLY', comment: 'maxDist, playerOnly' },
  { value: 27, label: 'LOOT_RECIPIENTS', comment: 'all players that tagged creature' },
  { value: 28, label: 'FARTHEST', comment: 'maxDist, playerOnly, isInLos' },
  { value: 29, label: 'VEHICLE_ACCESSORY', comment: 'seat number' },
  { value: 100, label: 'INVOKER_SUMMON', comment: 'Ashamane: entry' },
];

export const SMART_EVENT_FLAGS: EnumOption[] = [
  { value: 0x001, label: 'NOT_REPEATABLE', comment: 'Event cannot repeat' },
  { value: 0x002, label: 'DIFFICULTY_0', comment: 'Normal' },
  { value: 0x004, label: 'DIFFICULTY_1', comment: 'Heroic' },
  { value: 0x008, label: 'DIFFICULTY_2', comment: 'Difficulty 2' },
  { value: 0x010, label: 'DIFFICULTY_3', comment: 'Difficulty 3' },
  { value: 0x020, label: 'RESERVED_5', comment: 'Reserved' },
  { value: 0x040, label: 'RESERVED_6', comment: 'Reserved' },
  { value: 0x080, label: 'DEBUG_ONLY', comment: 'Debug build only' },
  { value: 0x100, label: 'DONT_RESET', comment: 'No reset in OnReset()' },
  { value: 0x200, label: 'WHILE_CHARMED', comment: 'Occurs while charmed' },
  { value: 0x400, label: 'DIFFICULTY_4', comment: 'Mythic' },
  { value: 0x800, label: 'DIFFICULTY_5', comment: 'Mythic Keystone' },
];

export const CONDITION_TYPES: EnumOption[] = [
  { value: 0, label: 'NONE', comment: 'always true' },
  { value: 1, label: 'AURA', comment: 'spell_id, effindex' },
  { value: 2, label: 'ITEM', comment: 'item_id, count, bank' },
  { value: 3, label: 'ITEM_EQUIPPED', comment: 'item_id' },
  { value: 4, label: 'ZONEID', comment: 'zone_id' },
  { value: 5, label: 'REPUTATION_RANK', comment: 'faction_id, rankMask' },
  { value: 6, label: 'TEAM', comment: 'player_team (469=Alliance, 67=Horde)' },
  { value: 7, label: 'SKILL', comment: 'skill_id, skill_value' },
  { value: 8, label: 'QUESTREWARDED', comment: 'quest_id' },
  { value: 9, label: 'QUESTTAKEN', comment: 'quest_id' },
  { value: 10, label: 'DRUNKENSTATE', comment: 'DrunkenState' },
  { value: 11, label: 'WORLD_STATE', comment: 'index, value' },
  { value: 12, label: 'ACTIVE_EVENT', comment: 'event_id' },
  { value: 13, label: 'INSTANCE_INFO', comment: 'entry, data, type' },
  { value: 14, label: 'QUEST_NONE', comment: 'quest_id' },
  { value: 15, label: 'CLASS', comment: 'class' },
  { value: 16, label: 'RACE', comment: 'race' },
  { value: 17, label: 'ACHIEVEMENT', comment: 'achievement_id' },
  { value: 18, label: 'TITLE', comment: 'title id' },
  { value: 20, label: 'GENDER', comment: 'gender' },
  { value: 21, label: 'UNIT_STATE', comment: 'unitState' },
  { value: 22, label: 'MAPID', comment: 'map_id' },
  { value: 23, label: 'AREAID', comment: 'area_id' },
  { value: 24, label: 'CREATURE_TYPE', comment: 'cinfo.type' },
  { value: 25, label: 'SPELL', comment: 'spell_id' },
  { value: 26, label: 'PHASEID', comment: 'phaseid' },
  { value: 27, label: 'LEVEL', comment: 'level, ComparisonType' },
  { value: 28, label: 'QUEST_COMPLETE', comment: 'quest_id' },
  { value: 29, label: 'NEAR_CREATURE', comment: 'creature entry, distance, dead' },
  { value: 30, label: 'NEAR_GAMEOBJECT', comment: 'gameobject entry, distance' },
  { value: 31, label: 'OBJECT_ENTRY_GUID_LEGACY', comment: 'LEGACY_TypeID, entry, guid' },
  { value: 32, label: 'TYPE_MASK_LEGACY', comment: 'LEGACY_TypeMask' },
  { value: 33, label: 'RELATION_TO', comment: 'ConditionTarget, RelationType' },
  { value: 34, label: 'REACTION_TO', comment: 'ConditionTarget, rankMask' },
  { value: 35, label: 'DISTANCE_TO', comment: 'ConditionTarget, distance, ComparisonType' },
  { value: 36, label: 'ALIVE', comment: '' },
  { value: 37, label: 'HP_VAL', comment: 'hpVal, ComparisonType' },
  { value: 38, label: 'HP_PCT', comment: 'hpPct, ComparisonType' },
  { value: 39, label: 'REALM_ACHIEVEMENT', comment: 'achievement_id' },
  { value: 40, label: 'IN_WATER', comment: '' },
  { value: 41, label: 'TERRAIN_SWAP', comment: 'terrainSwap' },
  { value: 42, label: 'STAND_STATE', comment: 'stateType, state' },
  { value: 43, label: 'DAILY_QUEST_DONE', comment: 'quest id' },
  { value: 44, label: 'CHARMED', comment: '' },
  { value: 45, label: 'PET_TYPE', comment: 'mask' },
  { value: 46, label: 'TAXI', comment: '' },
  { value: 47, label: 'QUESTSTATE', comment: 'quest_id, state_mask' },
  { value: 48, label: 'QUEST_OBJECTIVE_COMPLETE', comment: 'ID' },
  { value: 49, label: 'DIFFICULTY_ID', comment: 'Difficulty' },
  { value: 51, label: 'OBJECT_ENTRY_GUID', comment: 'TypeID, entry, guid' },
  { value: 52, label: 'TYPE_MASK', comment: 'TypeMask' },
];

export const CONDITION_SOURCE_TYPES: EnumOption[] = [
  { value: 0, label: 'NONE' },
  { value: 1, label: 'CREATURE_LOOT_TEMPLATE' },
  { value: 2, label: 'DISENCHANT_LOOT_TEMPLATE' },
  { value: 3, label: 'FISHING_LOOT_TEMPLATE' },
  { value: 4, label: 'GAMEOBJECT_LOOT_TEMPLATE' },
  { value: 5, label: 'ITEM_LOOT_TEMPLATE' },
  { value: 6, label: 'MAIL_LOOT_TEMPLATE' },
  { value: 7, label: 'MILLING_LOOT_TEMPLATE' },
  { value: 8, label: 'PICKPOCKETING_LOOT_TEMPLATE' },
  { value: 9, label: 'PROSPECTING_LOOT_TEMPLATE' },
  { value: 10, label: 'REFERENCE_LOOT_TEMPLATE' },
  { value: 11, label: 'SKINNING_LOOT_TEMPLATE' },
  { value: 12, label: 'SPELL_LOOT_TEMPLATE' },
  { value: 13, label: 'SPELL_IMPLICIT_TARGET' },
  { value: 14, label: 'GOSSIP_MENU' },
  { value: 15, label: 'GOSSIP_MENU_OPTION' },
  { value: 16, label: 'CREATURE_TEMPLATE_VEHICLE' },
  { value: 17, label: 'SPELL' },
  { value: 18, label: 'SPELL_CLICK_EVENT' },
  { value: 19, label: 'QUEST_AVAILABLE' },
  { value: 21, label: 'VEHICLE_SPELL' },
  { value: 22, label: 'SMART_EVENT' },
  { value: 23, label: 'NPC_VENDOR' },
  { value: 24, label: 'SPELL_PROC' },
  { value: 25, label: 'TERRAIN_SWAP' },
  { value: 26, label: 'PHASE' },
  { value: 27, label: 'GRAVEYARD' },
  { value: 28, label: 'SCRAPPING_LOOT_TEMPLATE' },
];

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

export interface DbConnection {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function createEmptyScriptRow(entryorguid: number = 0, source_type: number = 0): SmartScriptRow {
  return {
    entryorguid,
    source_type,
    id: 0,
    link: 0,
    event_type: 0,
    event_phase_mask: 0,
    event_chance: 100,
    event_flags: 0,
    event_param1: 0,
    event_param2: 0,
    event_param3: 0,
    event_param4: 0,
    event_param5: 0,
    event_param_string: '',
    action_type: 0,
    action_param1: 0,
    action_param2: 0,
    action_param3: 0,
    action_param4: 0,
    action_param5: 0,
    action_param6: 0,
    target_type: 0,
    target_param1: 0,
    target_param2: 0,
    target_param3: 0,
    target_x: 0,
    target_y: 0,
    target_z: 0,
    target_o: 0,
    comment: '',
  };
}

export function createEmptyConditionRow(): ConditionRow {
  return {
    SourceTypeOrReferenceId: 22,
    SourceGroup: 0,
    SourceEntry: 0,
    SourceId: 0,
    ElseGroup: 0,
    ConditionTypeOrReference: 0,
    ConditionTarget: 0,
    ConditionValue1: 0,
    ConditionValue2: 0,
    ConditionValue3: 0,
    NegativeCondition: false,
    ErrorType: 0,
    ErrorTextId: 0,
    ScriptName: '',
  };
}

export function generateInsertSQL(row: SmartScriptRow): string {
  const cols = [
    'entryorguid', 'source_type', 'id', 'link',
    'event_type', 'event_phase_mask', 'event_chance', 'event_flags',
    'event_param1', 'event_param2', 'event_param3', 'event_param4', 'event_param5',
    'event_param_string',
    'action_type', 'action_param1', 'action_param2', 'action_param3',
    'action_param4', 'action_param5', 'action_param6',
    'target_type', 'target_param1', 'target_param2', 'target_param3',
    'target_x', 'target_y', 'target_z', 'target_o',
    'comment',
  ];
  const vals = [
    row.entryorguid, row.source_type, row.id, row.link,
    row.event_type, row.event_phase_mask, row.event_chance, row.event_flags,
    row.event_param1, row.event_param2, row.event_param3, row.event_param4, row.event_param5,
    `'${row.event_param_string.replace(/'/g, "''")}'`,
    row.action_type, row.action_param1, row.action_param2, row.action_param3,
    row.action_param4, row.action_param5, row.action_param6,
    row.target_type, row.target_param1, row.target_param2, row.target_param3,
    row.target_x, row.target_y, row.target_z, row.target_o,
    `'${row.comment.replace(/'/g, "''")}'`,
  ];
  return `INSERT INTO \`smart_scripts\` (${cols.map(c => `\`${c}\``).join(', ')})\nVALUES (${vals.join(', ')});`;
}

export function generateConditionInsertSQL(cond: ConditionRow): string {
  const cols = [
    'SourceTypeOrReferenceId', 'SourceGroup', 'SourceEntry', 'SourceId',
    'ElseGroup', 'ConditionTypeOrReference', 'ConditionTarget',
    'ConditionValue1', 'ConditionValue2', 'ConditionValue3',
    'NegativeCondition', 'ErrorType', 'ErrorTextId', 'ScriptName',
  ];
  const vals = [
    cond.SourceTypeOrReferenceId, cond.SourceGroup, cond.SourceEntry, cond.SourceId,
    cond.ElseGroup, cond.ConditionTypeOrReference, cond.ConditionTarget,
    cond.ConditionValue1, cond.ConditionValue2, cond.ConditionValue3,
    cond.NegativeCondition ? 1 : 0, cond.ErrorType, cond.ErrorTextId,
    `'${cond.ScriptName.replace(/'/g, "''")}'`,
  ];
  return `INSERT INTO \`conditions\` (${cols.map(c => `\`${c}\``).join(', ')})\nVALUES (${vals.join(', ')});`;
}

export function generateConditionDescription(cond: ConditionRow): string {
  const type = cond.ConditionTypeOrReference;
  const v1 = cond.ConditionValue1;
  const v2 = cond.ConditionValue2;
  const v3 = cond.ConditionValue3;
  const target = cond.ConditionTarget;
  const negative = cond.NegativeCondition ? 'NOT ' : '';

  const descriptions: Record<number, string> = {
    0: `${negative}No condition`,
    1: `${negative}Has aura spell ${v1} (effect ${v2})`,
    2: `${negative}Has item ${v1} (count ${v2}, bank ${v3})`,
    3: `${negative}Has item ${v1} equipped`,
    4: `${negative}In zone ${v1}`,
    5: `${negative}Reputation rank ${v2} with faction ${v1}`,
    6: `${negative}Team is ${v1 === 469 ? 'Alliance' : v1 === 67 ? 'Horde' : v1}`,
    7: `${negative}Skill ${v1} level ${v2}`,
    8: `${negative}Quest ${v1} rewarded`,
    9: `${negative}Quest ${v1} taken`,
    10: `${negative}Drunken state ${v1}`,
    11: `${negative}World state ${v1} = ${v2}`,
    12: `${negative}Active event ${v1}`,
    13: `${negative}Instance data entry ${v1} data ${v2} type ${v3}`,
    14: `${negative}Quest ${v1} not taken`,
    15: `${negative}Class is ${v1}`,
    16: `${negative}Race is ${v1}`,
    17: `${negative}Achievement ${v1}`,
    18: `${negative}Title ${v1}`,
    20: `${negative}Gender is ${v1 === 0 ? 'Male' : 'Female'}`,
    21: `${negative}Unit state ${v1}`,
    22: `${negative}In map ${v1}`,
    23: `${negative}In area ${v1}`,
    24: `${negative}Creature type ${v1}`,
    25: `${negative}Has spell ${v1}`,
    26: `${negative}In phase ${v1}`,
    27: `${negative}Level ${v1} (${v2 === 0 ? 'equal' : v2 === 1 ? 'higher' : v2 === 2 ? 'lower' : 'equal/higher'})`,
    28: `${negative}Quest ${v1} completed`,
    29: `${negative}Near creature ${v1} (dist ${v2}, dead ${v3})`,
    30: `${negative}Near gameobject ${v1} (dist ${v2})`,
    31: `${negative}Object entry ${v1} guid ${v3} (legacy)`,
    32: `${negative}Type mask ${v1} (legacy)`,
    33: `${negative}Relation to target ${v1} is ${v2}`,
    34: `${negative}Reaction to target ${v1} is ${v2}`,
    35: `${negative}Distance to target ${v1} is ${v2} (${v2 === 0 ? 'equal' : v2 === 1 ? 'higher' : v2 === 2 ? 'lower' : 'equal/higher'})`,
    36: `${negative}Is alive`,
    37: `${negative}HP ${v1} (${v2 === 0 ? 'equal' : v2 === 1 ? 'higher' : v2 === 2 ? 'lower' : 'equal/higher'})`,
    38: `${negative}HP ${v1}% (${v2 === 0 ? 'equal' : v2 === 1 ? 'higher' : v2 === 2 ? 'lower' : 'equal/higher'})`,
    39: `${negative}Realm achievement ${v1}`,
    40: `${negative}In water`,
    41: `${negative}Terrain swap ${v1}`,
    42: `${negative}Stand state ${v1} (${v2})`,
    43: `${negative}Daily quest ${v1} done`,
    44: `${negative}Is charmed`,
    45: `${negative}Pet type mask ${v1}`,
    46: `${negative}On taxi`,
    47: `${negative}Quest ${v1} state ${v2}`,
    48: `${negative}Quest objective ${v1} complete`,
    49: `${negative}Difficulty ${v1}`,
    51: `${negative}Object entry ${v1} guid ${v3}`,
    52: `${negative}Type mask ${v1}`,
  };

  let desc = descriptions[type] ?? `${negative}Condition type ${type}`;
  
  if (target > 0) {
    desc += ` (target ${target})`;
  }
  
  return desc;
}

export function generateDeleteSQL(entryorguid: number, source_type: number): string {
  return `DELETE FROM \`smart_scripts\` WHERE \`entryorguid\` = ${entryorguid} AND \`source_type\` = ${source_type};`;
}

export function generateUpdateCreatureTemplateSQL(entryorguid: number, source_type: number): string {
  if (source_type === 0 && entryorguid > 0) {
    return `UPDATE \`creature_template\` SET \`AIName\` = 'SmartAI' WHERE \`entry\` = ${entryorguid};`;
  }
  if (source_type === 1 && entryorguid > 0) {
    return `UPDATE \`gameobject_template\` SET \`AIName\` = 'SmartGameObjectAI' WHERE \`entry\` = ${entryorguid};`;
  }
  return '';
}
