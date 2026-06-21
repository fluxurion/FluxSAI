mod db;
mod sql_gen;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(db::DbState {
            pool: std::sync::Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            db::connect_db,
            db::disconnect_db,
            db::test_connection,
            db::fetch_scripts,
            db::fetch_script_by_entry,
            db::insert_script,
            db::delete_script,
            db::fetch_conditions,
            db::fetch_all_conditions_for_entry,
            db::insert_condition,
            db::delete_conditions_for_smart_event,
            sql_gen::export_scripts_sql,
            sql_gen::save_entry_to_file,
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;
                if let Some(window) = _app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
