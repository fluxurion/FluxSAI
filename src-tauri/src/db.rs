use serde::{Deserialize, Serialize};
use sqlx::mysql::MySqlPoolOptions;
use sqlx::FromRow;
use sqlx::MySqlPool;
use std::sync::Mutex;

pub struct DbState {
    pub pool: Mutex<Option<MySqlPool>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DbConfig {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
    pub database: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct SmartScriptRow {
    pub entryorguid: i64,
    pub source_type: u8,
    pub id: u16,
    pub link: u16,
    pub event_type: u8,
    pub event_phase_mask: u8,
    pub event_chance: u8,
    pub event_flags: u16,
    pub event_param1: u32,
    pub event_param2: u32,
    pub event_param3: u32,
    pub event_param4: u32,
    pub event_param5: u32,
    pub event_param_string: String,
    pub action_type: u8,
    pub action_param1: u32,
    pub action_param2: u32,
    pub action_param3: u32,
    pub action_param4: u32,
    pub action_param5: u32,
    pub action_param6: u32,
    pub target_type: u8,
    pub target_param1: u32,
    pub target_param2: u32,
    pub target_param3: u32,
    pub target_x: f32,
    pub target_y: f32,
    pub target_z: f32,
    pub target_o: f32,
    pub comment: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct ConditionRow {
    #[serde(rename = "SourceTypeOrReferenceId")]
    pub source_type_or_reference_id: i32,
    #[serde(rename = "SourceGroup")]
    pub source_group: u32,
    #[serde(rename = "SourceEntry")]
    pub source_entry: i32,
    #[serde(rename = "SourceId")]
    pub source_id: u32,
    #[serde(rename = "ElseGroup")]
    pub else_group: u32,
    #[serde(rename = "ConditionTypeOrReference")]
    pub condition_type_or_reference: i32,
    #[serde(rename = "ConditionTarget")]
    pub condition_target: u8,
    #[serde(rename = "ConditionValue1")]
    pub condition_value1: u32,
    #[serde(rename = "ConditionValue2")]
    pub condition_value2: u32,
    #[serde(rename = "ConditionValue3")]
    pub condition_value3: u32,
    #[serde(rename = "NegativeCondition")]
    pub negative_condition: bool,
    #[serde(rename = "ErrorType")]
    pub error_type: u32,
    #[serde(rename = "ErrorTextId")]
    pub error_text_id: u32,
    #[serde(rename = "ScriptName")]
    pub script_name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct TemplateEntry {
    pub entry: i64,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct CreatureTemplateInfo {
    pub entry: u32,
    pub name: String,
    pub ainame: String,
    pub scriptname: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct GuidRow {
    pub guid: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NameSearchResult {
    pub entries: Vec<TemplateEntry>,
    pub scripts: Vec<SmartScriptRow>,
}

fn get_pool(state: &tauri::State<'_, DbState>) -> Result<MySqlPool, String> {
    let guard = state.pool.lock().map_err(|e| format!("Lock error: {}", e))?;
    guard
        .as_ref()
        .cloned()
        .ok_or_else(|| "Not connected to database".to_string())
}

#[tauri::command]
pub async fn connect_db(config: DbConfig, state: tauri::State<'_, DbState>) -> Result<String, String> {
    let url = format!(
        "mysql://{}:{}@{}:{}/{}",
        config.user, config.password, config.host, config.port, config.database
    );

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;

    let mut guard = state.pool.lock().map_err(|e| format!("Lock error: {}", e))?;
    *guard = Some(pool.clone());

    drop(guard);

    Ok(format!(
        "Connected to {}:{} / {}",
        config.host, config.port, config.database
    ))
}

#[tauri::command]
pub async fn disconnect_db(state: tauri::State<'_, DbState>) -> Result<String, String> {
    let pool = {
        let mut guard = state.pool.lock().map_err(|e| format!("Lock error: {}", e))?;
        guard.take()
    };
    if let Some(pool) = pool {
        pool.close().await;
    }
    Ok("Disconnected".to_string())
}

#[tauri::command]
pub async fn test_connection(config: DbConfig) -> Result<String, String> {
    let url = format!(
        "mysql://{}:{}@{}:{}/{}",
        config.user, config.password, config.host, config.port, config.database
    );

    let pool = MySqlPoolOptions::new()
        .max_connections(1)
        .connect(&url)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;

    pool.close().await;
    Ok("Connection successful".to_string())
}

#[tauri::command]
pub async fn fetch_scripts(
    entryorguid: Option<i64>,
    source_type: Option<u8>,
    state: tauri::State<'_, DbState>,
) -> Result<Vec<SmartScriptRow>, String> {
    let pool = get_pool(&state)?;

    let query = if entryorguid.is_some() && source_type.is_some() {
        "SELECT entryorguid, source_type, id, link, event_type, event_phase_mask, event_chance, event_flags, \
         event_param1, event_param2, event_param3, event_param4, event_param5, event_param_string, \
         action_type, action_param1, action_param2, action_param3, action_param4, action_param5, action_param6, \
         target_type, target_param1, target_param2, target_param3, target_x, target_y, target_z, target_o, comment \
         FROM smart_scripts WHERE entryorguid = ? AND source_type = ? ORDER BY id"
    } else {
        "SELECT entryorguid, source_type, id, link, event_type, event_phase_mask, event_chance, event_flags, \
         event_param1, event_param2, event_param3, event_param4, event_param5, event_param_string, \
         action_type, action_param1, action_param2, action_param3, action_param4, action_param5, action_param6, \
         target_type, target_param1, target_param2, target_param3, target_x, target_y, target_z, target_o, comment \
         FROM smart_scripts ORDER BY entryorguid, source_type, id LIMIT 500"
    };

    if entryorguid.is_some() && source_type.is_some() {
        sqlx::query_as::<_, SmartScriptRow>(query)
            .bind(entryorguid.unwrap())
            .bind(source_type.unwrap())
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("Query failed: {}", e))
    } else {
        sqlx::query_as::<_, SmartScriptRow>(query)
            .fetch_all(&pool)
            .await
            .map_err(|e| format!("Query failed: {}", e))
    }
}

#[tauri::command]
pub async fn fetch_script_by_entry(
    entryorguid: i64,
    source_type: u8,
    state: tauri::State<'_, DbState>,
) -> Result<Vec<SmartScriptRow>, String> {
    fetch_scripts(Some(entryorguid), Some(source_type), state).await
}

#[tauri::command]
pub async fn search_scripts_by_name(
    name: String,
    source_type: u8,
    state: tauri::State<'_, DbState>,
) -> Result<NameSearchResult, String> {
    let pool = get_pool(&state)?;
    let search_pattern = format!("%{}%", name);

    let (template_table, instance_table) = match source_type {
        0 => ("creature_template", "creature"),
        1 => ("gameobject_template", "gameobject"),
        _ => return Err("Name search is only supported for Creature (0) and GameObject (1) source types".to_string()),
    };

    // Step 1: Find template entries matching the name
    let entries_sql = format!(
        "SELECT entry, name FROM {} WHERE name LIKE ? ORDER BY entry LIMIT 100",
        template_table
    );
    let entries: Vec<TemplateEntry> = sqlx::query_as::<_, TemplateEntry>(&entries_sql)
        .bind(&search_pattern)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    if entries.is_empty() {
        return Ok(NameSearchResult { entries: vec![], scripts: vec![] });
    }

    let entry_ids: Vec<i64> = entries.iter().map(|e| e.entry).collect();
    let placeholders = entry_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");

    // Step 2: Search smart_scripts for positive entryorguid = entry
    let scripts_sql = format!(
        "SELECT entryorguid, source_type, id, link, event_type, event_phase_mask, event_chance, event_flags, \
         event_param1, event_param2, event_param3, event_param4, event_param5, event_param_string, \
         action_type, action_param1, action_param2, action_param3, action_param4, action_param5, action_param6, \
         target_type, target_param1, target_param2, target_param3, target_x, target_y, target_z, target_o, comment \
         FROM smart_scripts WHERE entryorguid IN ({}) AND source_type = ? ORDER BY entryorguid, id",
        placeholders
    );

    let mut q = sqlx::query_as::<_, SmartScriptRow>(&scripts_sql);
    for id in &entry_ids {
        q = q.bind(*id);
    }
    q = q.bind(source_type);

    let scripts: Vec<SmartScriptRow> = q
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    if !scripts.is_empty() {
        return Ok(NameSearchResult { entries, scripts });
    }

    // Step 3: No entry-based scripts found — look up guids from instance table
    let guid_sql = format!(
        "SELECT guid FROM {} WHERE id IN ({})",
        instance_table, placeholders
    );

    let mut gq = sqlx::query_as::<_, GuidRow>(&guid_sql);
    for id in &entry_ids {
        gq = gq.bind(*id as u32);
    }

    let guids: Vec<GuidRow> = gq
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    if guids.is_empty() {
        return Ok(NameSearchResult { entries, scripts: vec![] });
    }

    // Step 4: Search smart_scripts for negative entryorguid = -guid
    let guid_values: Vec<u32> = guids.iter().map(|g| g.guid).collect();
    let guid_placeholders = guid_values.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let guid_scripts_sql = format!(
        "SELECT entryorguid, source_type, id, link, event_type, event_phase_mask, event_chance, event_flags, \
         event_param1, event_param2, event_param3, event_param4, event_param5, event_param_string, \
         action_type, action_param1, action_param2, action_param3, action_param4, action_param5, action_param6, \
         target_type, target_param1, target_param2, target_param3, target_x, target_y, target_z, target_o, comment \
         FROM smart_scripts WHERE entryorguid IN ({}) AND source_type = ? ORDER BY entryorguid, id",
        guid_placeholders
    );

    let mut gq2 = sqlx::query_as::<_, SmartScriptRow>(&guid_scripts_sql);
    for guid in &guid_values {
        gq2 = gq2.bind(-(*guid as i64));
    }
    gq2 = gq2.bind(source_type);

    let guid_scripts: Vec<SmartScriptRow> = gq2
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    Ok(NameSearchResult { entries, scripts: guid_scripts })
}

#[tauri::command]
pub async fn search_scripts_by_action_or_event(
    search_field: String,
    value: u8,
    source_type: u8,
    state: tauri::State<'_, DbState>,
) -> Result<NameSearchResult, String> {
    let pool = get_pool(&state)?;

    let column = match search_field.as_str() {
        "action" => "action_type",
        "event" => "event_type",
        _ => return Err("Invalid search field. Use 'action' or 'event'.".to_string()),
    };

    let scripts_sql = format!(
        "SELECT entryorguid, source_type, id, link, event_type, event_phase_mask, event_chance, event_flags, \
         event_param1, event_param2, event_param3, event_param4, event_param5, event_param_string, \
         action_type, action_param1, action_param2, action_param3, action_param4, action_param5, action_param6, \
         target_type, target_param1, target_param2, target_param3, target_x, target_y, target_z, target_o, comment \
         FROM smart_scripts WHERE {} = ? AND source_type = ? ORDER BY entryorguid, id LIMIT 500",
        column
    );

    let scripts: Vec<SmartScriptRow> = sqlx::query_as::<_, SmartScriptRow>(&scripts_sql)
        .bind(value)
        .bind(source_type)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    if scripts.is_empty() {
        return Ok(NameSearchResult { entries: vec![], scripts: vec![] });
    }

    // Collect distinct entryorguid values in order
    let mut entry_set: Vec<i64> = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for s in &scripts {
        if seen.insert(s.entryorguid) {
            entry_set.push(s.entryorguid);
        }
    }

    let mut entries: Vec<TemplateEntry> = Vec::new();

    let (template_table, instance_table) = match source_type {
        0 => (Some("creature_template"), Some("creature")),
        1 => (Some("gameobject_template"), Some("gameobject")),
        _ => (None, None),
    };

    if let (Some(template_table), Some(instance_table)) = (template_table, instance_table) {
        // Resolve positive entries directly from template table
        let positive: Vec<i64> = entry_set.iter().filter(|e| **e >= 0).copied().collect();
        if !positive.is_empty() {
            let placeholders = positive.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let sql = format!(
                "SELECT entry, name FROM {} WHERE entry IN ({})",
                template_table, placeholders
            );
            let mut q = sqlx::query_as::<_, TemplateEntry>(&sql);
            for e in &positive {
                q = q.bind(*e as u32);
            }
            let found: Vec<TemplateEntry> = q
                .fetch_all(&pool)
                .await
                .map_err(|e| format!("Query failed: {}", e))?;
            entries.extend(found);
        }

        // Resolve negative entries (guids) through instance table → template table
        let guids: Vec<u32> = entry_set.iter().filter(|e| **e < 0).map(|e| (-e) as u32).collect();
        if !guids.is_empty() {
            let placeholders = guids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let sql = format!(
                "SELECT DISTINCT t.entry, t.name FROM {} t JOIN {} i ON i.id = t.entry WHERE i.guid IN ({})",
                template_table, instance_table, placeholders
            );
            let mut q = sqlx::query_as::<_, TemplateEntry>(&sql);
            for g in &guids {
                q = q.bind(*g);
            }
            let found: Vec<TemplateEntry> = q
                .fetch_all(&pool)
                .await
                .map_err(|e| format!("Query failed: {}", e))?;
            // Store with negative entry (matching entryorguid) so pager can find them
            for mut f in found {
                f.entry = -f.entry;
                entries.push(f);
            }
        }
    }

    // For any entries not resolved, add with entryorguid as name
    let resolved: std::collections::HashSet<i64> = entries.iter().map(|e| e.entry).collect();
    for e in &entry_set {
        if !resolved.contains(e) {
            entries.push(TemplateEntry { entry: *e, name: e.to_string() });
        }
    }

    Ok(NameSearchResult { entries, scripts })
}

#[tauri::command]
pub async fn insert_script(row: SmartScriptRow, state: tauri::State<'_, DbState>) -> Result<String, String> {
    let pool = get_pool(&state)?;

    sqlx::query(
        "INSERT INTO smart_scripts (entryorguid, source_type, id, link, event_type, event_phase_mask, \
         event_chance, event_flags, event_param1, event_param2, event_param3, event_param4, event_param5, \
         event_param_string, action_type, action_param1, action_param2, action_param3, action_param4, \
         action_param5, action_param6, target_type, target_param1, target_param2, target_param3, \
         target_x, target_y, target_z, target_o, comment) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) \
         ON DUPLICATE KEY UPDATE \
         link=VALUES(link), event_type=VALUES(event_type), event_phase_mask=VALUES(event_phase_mask), \
         event_chance=VALUES(event_chance), event_flags=VALUES(event_flags), \
         event_param1=VALUES(event_param1), event_param2=VALUES(event_param2), \
         event_param3=VALUES(event_param3), event_param4=VALUES(event_param4), \
         event_param5=VALUES(event_param5), event_param_string=VALUES(event_param_string), \
         action_type=VALUES(action_type), action_param1=VALUES(action_param1), \
         action_param2=VALUES(action_param2), action_param3=VALUES(action_param3), \
         action_param4=VALUES(action_param4), action_param5=VALUES(action_param5), \
         action_param6=VALUES(action_param6), target_type=VALUES(target_type), \
         target_param1=VALUES(target_param1), target_param2=VALUES(target_param2), \
         target_param3=VALUES(target_param3), target_x=VALUES(target_x), \
         target_y=VALUES(target_y), target_z=VALUES(target_z), target_o=VALUES(target_o), \
         comment=VALUES(comment)"
    )
    .bind(row.entryorguid)
    .bind(row.source_type)
    .bind(row.id)
    .bind(row.link)
    .bind(row.event_type)
    .bind(row.event_phase_mask)
    .bind(row.event_chance)
    .bind(row.event_flags)
    .bind(row.event_param1)
    .bind(row.event_param2)
    .bind(row.event_param3)
    .bind(row.event_param4)
    .bind(row.event_param5)
    .bind(&row.event_param_string)
    .bind(row.action_type)
    .bind(row.action_param1)
    .bind(row.action_param2)
    .bind(row.action_param3)
    .bind(row.action_param4)
    .bind(row.action_param5)
    .bind(row.action_param6)
    .bind(row.target_type)
    .bind(row.target_param1)
    .bind(row.target_param2)
    .bind(row.target_param3)
    .bind(row.target_x)
    .bind(row.target_y)
    .bind(row.target_z)
    .bind(row.target_o)
    .bind(&row.comment)
    .execute(&pool)
    .await
    .map_err(|e| format!("Insert failed: {}", e))?;

    Ok("Script inserted successfully".to_string())
}

#[tauri::command]
pub async fn delete_script(
    entryorguid: i64,
    source_type: u8,
    id: u16,
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let pool = get_pool(&state)?;

    sqlx::query("DELETE FROM smart_scripts WHERE entryorguid = ? AND source_type = ? AND id = ?")
        .bind(entryorguid)
        .bind(source_type)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Delete failed: {}", e))?;

    Ok("Script deleted successfully".to_string())
}

#[tauri::command]
pub async fn fetch_conditions(
    source_entry: i32,
    source_id: u32,
    state: tauri::State<'_, DbState>,
) -> Result<Vec<ConditionRow>, String> {
    let pool = get_pool(&state)?;

    sqlx::query_as::<_, ConditionRow>(
        "SELECT SourceTypeOrReferenceId, SourceGroup, SourceEntry, SourceId, ElseGroup, \
         ConditionTypeOrReference, ConditionTarget, ConditionValue1, ConditionValue2, ConditionValue3, \
         NegativeCondition, ErrorType, ErrorTextId, ScriptName \
         FROM conditions WHERE SourceTypeOrReferenceId = 22 AND SourceEntry = ? AND SourceId = ? ORDER BY ElseGroup"
    )
    .bind(source_entry)
    .bind(source_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Query failed: {}", e))
}

#[tauri::command]
pub async fn fetch_all_conditions_for_entry(
    source_entry: i32,
    state: tauri::State<'_, DbState>,
) -> Result<Vec<ConditionRow>, String> {
    let pool = get_pool(&state)?;

    sqlx::query_as::<_, ConditionRow>(
        "SELECT SourceTypeOrReferenceId, SourceGroup, SourceEntry, SourceId, ElseGroup, \
         ConditionTypeOrReference, ConditionTarget, ConditionValue1, ConditionValue2, ConditionValue3, \
         NegativeCondition, ErrorType, ErrorTextId, ScriptName \
         FROM conditions WHERE SourceTypeOrReferenceId = 22 AND SourceEntry = ? ORDER BY SourceId, ElseGroup"
    )
    .bind(source_entry)
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Query failed: {}", e))
}

#[tauri::command]
pub async fn insert_condition(row: ConditionRow, state: tauri::State<'_, DbState>) -> Result<String, String> {
    let pool = get_pool(&state)?;

    sqlx::query(
        "INSERT INTO conditions (SourceTypeOrReferenceId, SourceGroup, SourceEntry, SourceId, ElseGroup, \
         ConditionTypeOrReference, ConditionTarget, ConditionValue1, ConditionValue2, ConditionValue3, \
         NegativeCondition, ErrorType, ErrorTextId, ScriptName) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(row.source_type_or_reference_id)
    .bind(row.source_group)
    .bind(row.source_entry)
    .bind(row.source_id)
    .bind(row.else_group)
    .bind(row.condition_type_or_reference)
    .bind(row.condition_target)
    .bind(row.condition_value1)
    .bind(row.condition_value2)
    .bind(row.condition_value3)
    .bind(row.negative_condition)
    .bind(row.error_type)
    .bind(row.error_text_id)
    .bind(&row.script_name)
    .execute(&pool)
    .await
    .map_err(|e| format!("Insert failed: {}", e))?;

    Ok("Condition inserted successfully".to_string())
}

#[tauri::command]
pub async fn delete_conditions_for_smart_event(
    source_entry: i32,
    source_id: u32,
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let pool = get_pool(&state)?;

    sqlx::query("DELETE FROM conditions WHERE SourceTypeOrReferenceId = 22 AND SourceEntry = ? AND SourceId = ?")
        .bind(source_entry)
        .bind(source_id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Delete failed: {}", e))?;

    Ok("Conditions deleted successfully".to_string())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParseResult {
    pub scripts: Vec<SmartScriptRow>,
    pub conditions: Vec<ConditionRow>,
}

#[tauri::command]
pub fn parse_sql(sql: String) -> Result<ParseResult, String> {
    let mut scripts = Vec::new();
    let mut conditions = Vec::new();

    for line in sql.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("--") || line.starts_with("#") {
            continue;
        }

        if line.to_uppercase().starts_with("INSERT INTO `smart_scripts`") {
            match parse_smart_script_insert(line) {
                Ok(script) => scripts.push(script),
                Err(e) => eprintln!("Failed to parse script: {}", e),
            }
        } else if line.to_uppercase().starts_with("INSERT INTO `conditions`") {
            match parse_condition_insert(line) {
                Ok(condition) => conditions.push(condition),
                Err(e) => eprintln!("Failed to parse condition: {}", e),
            }
        }
    }

    Ok(ParseResult { scripts, conditions })
}

fn parse_smart_script_insert(line: &str) -> Result<SmartScriptRow, String> {
    // Simple regex-based parser for INSERT statements
    // This is a simplified version - production code should use a proper SQL parser
    let values_start = line.find('(').ok_or("No opening parenthesis")?;
    let values_str = &line[values_start..];

    // Extract values between parentheses
    let values: Vec<&str> = values_str
        .split(|c: char| c == '(' || c == ')')
        .skip(1)
        .take_while(|s| !s.is_empty())
        .collect();

    if values.is_empty() {
        return Err("No values found".to_string());
    }

    let values_str = values[0];
    let value_strs: Vec<&str> = values_str
        .split(',')
        .map(|s| s.trim().trim_matches('\''))
        .collect();

    if value_strs.len() < 20 {
        return Err(format!("Expected at least 20 values, got {}", value_strs.len()));
    }

    let parse_u32 = |idx: usize| -> Result<u32, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid u32 at index {}", idx))
    };

    let parse_i64 = |idx: usize| -> Result<i64, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid i64 at index {}", idx))
    };

    let parse_u8 = |idx: usize| -> Result<u8, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid u8 at index {}", idx))
    };

    let parse_u16 = |idx: usize| -> Result<u16, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid u16 at index {}", idx))
    };

    let parse_f32 = |idx: usize| -> Result<f32, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid f32 at index {}", idx))
    };

    Ok(SmartScriptRow {
        entryorguid: parse_i64(0)?,
        source_type: parse_u8(1)?,
        id: parse_u16(2)?,
        link: parse_u16(3)?,
        event_type: parse_u8(4)?,
        event_phase_mask: parse_u8(5)?,
        event_chance: parse_u8(6)?,
        event_flags: parse_u16(7)?,
        event_param1: parse_u32(8)?,
        event_param2: parse_u32(9)?,
        event_param3: parse_u32(10)?,
        event_param4: parse_u32(11)?,
        event_param5: parse_u32(12)?,
        event_param_string: value_strs[13].to_string(),
        action_type: parse_u8(14)?,
        action_param1: parse_u32(15)?,
        action_param2: parse_u32(16)?,
        action_param3: parse_u32(17)?,
        action_param4: parse_u32(18)?,
        action_param5: parse_u32(19)?,
        action_param6: parse_u32(20)?,
        target_type: parse_u8(21)?,
        target_param1: parse_u32(22)?,
        target_param2: parse_u32(23)?,
        target_param3: parse_u32(24)?,
        target_x: if value_strs.len() > 25 { parse_f32(25).unwrap_or(0.0) } else { 0.0 },
        target_y: if value_strs.len() > 26 { parse_f32(26).unwrap_or(0.0) } else { 0.0 },
        target_z: if value_strs.len() > 27 { parse_f32(27).unwrap_or(0.0) } else { 0.0 },
        target_o: if value_strs.len() > 28 { parse_f32(28).unwrap_or(0.0) } else { 0.0 },
        comment: if value_strs.len() > 29 { value_strs[29].to_string() } else { String::new() },
    })
}

fn parse_condition_insert(line: &str) -> Result<ConditionRow, String> {
    let values_start = line.find('(').ok_or("No opening parenthesis")?;
    let values_str = &line[values_start..];

    let values: Vec<&str> = values_str
        .split(|c: char| c == '(' || c == ')')
        .skip(1)
        .take_while(|s| !s.is_empty())
        .collect();

    if values.is_empty() {
        return Err("No values found".to_string());
    }

    let values_str = values[0];
    let value_strs: Vec<&str> = values_str
        .split(',')
        .map(|s| s.trim().trim_matches('\''))
        .collect();

    if value_strs.len() < 14 {
        return Err(format!("Expected at least 14 values, got {}", value_strs.len()));
    }

    let parse_i32 = |idx: usize| -> Result<i32, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid i32 at index {}", idx))
    };

    let parse_u32 = |idx: usize| -> Result<u32, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid u32 at index {}", idx))
    };

    let parse_u8 = |idx: usize| -> Result<u8, String> {
        value_strs[idx].parse().map_err(|_| format!("Invalid u8 at index {}", idx))
    };

    let parse_bool = |idx: usize| -> Result<bool, String> {
        match value_strs[idx].to_lowercase().as_str() {
            "1" | "true" => Ok(true),
            "0" | "false" => Ok(false),
            _ => Err(format!("Invalid bool at index {}", idx)),
        }
    };

    Ok(ConditionRow {
        source_type_or_reference_id: parse_i32(0)?,
        source_group: parse_u32(1)?,
        source_entry: parse_i32(2)?,
        source_id: parse_u32(3)?,
        else_group: parse_u32(4)?,
        condition_type_or_reference: parse_i32(5)?,
        condition_target: parse_u8(6)?,
        condition_value1: parse_u32(7)?,
        condition_value2: parse_u32(8)?,
        condition_value3: parse_u32(9)?,
        negative_condition: parse_bool(10)?,
        error_type: parse_u32(11)?,
        error_text_id: parse_u32(12)?,
        script_name: if value_strs.len() > 13 { value_strs[13].to_string() } else { String::new() },
    })
}

#[tauri::command]
pub async fn fetch_creature_template_info(
    entry: u32,
    state: tauri::State<'_, DbState>,
) -> Result<Option<CreatureTemplateInfo>, String> {
    let pool = get_pool(&state)?;

    let info: Option<CreatureTemplateInfo> = sqlx::query_as::<_, CreatureTemplateInfo>(
        "SELECT entry, name, AIName as ainame, ScriptName as scriptname FROM creature_template WHERE entry = ?"
    )
    .bind(entry)
    .fetch_optional(&pool)
    .await
    .map_err(|e| format!("Query failed: {}", e))?;

    Ok(info)
}
