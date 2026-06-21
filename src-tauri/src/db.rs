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
pub async fn insert_script(row: SmartScriptRow, state: tauri::State<'_, DbState>) -> Result<String, String> {
    let pool = get_pool(&state)?;

    sqlx::query(
        "INSERT INTO smart_scripts (entryorguid, source_type, id, link, event_type, event_phase_mask, \
         event_chance, event_flags, event_param1, event_param2, event_param3, event_param4, event_param5, \
         event_param_string, action_type, action_param1, action_param2, action_param3, action_param4, \
         action_param5, action_param6, target_type, target_param1, target_param2, target_param3, \
         target_x, target_y, target_z, target_o, comment) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
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

