// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::json;
use tauri::{AboutMetadata, CustomMenuItem, Manager, Menu, MenuItem, Submenu};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct RecentlyOpenedPayload {
    recentFilepaths: Vec<String>,
}

fn handle_recently_opened_change(event: tauri::Event, app: &tauri::AppHandle) {
    // Extract payload from event
    let payload_string = event.payload().unwrap_or_default();
    let payload: RecentlyOpenedPayload =
        serde_json::from_str(&payload_string).unwrap_or(RecentlyOpenedPayload {
            recentFilepaths: vec![],
        });

    // Get the main window and its menu
    let main_window = app.get_window("main").unwrap();
    let menu_handle = main_window.menu_handle();

    // Create a new submenu with recent files
    let mut submenu = Menu::new();
    for (index, filepath) in payload.recentFilepaths.iter().enumerate() {
        let item = CustomMenuItem::new(format!("open-recent-{}", index), filepath.clone());
        submenu = submenu.add_item(item);
    }

    let open_recent_submenu = Submenu::new("Open Recent".to_string(), submenu);
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    window
        .get_window("splashscreen")
        .expect("no window labeled 'splashscreen' found")
        .close()
        .unwrap();
    // Show main window
    window
        .get_window("main")
        .expect("no window labeled 'main' found")
        .show()
        .unwrap();
}
fn main() {
    let open = CustomMenuItem::new("open".to_string(), "Open".to_string());
    let openURL = CustomMenuItem::new("openFromURL".to_string(), "Open Fadel URL".to_string());
    let open_recent = CustomMenuItem::new("open-recent".to_string(), "Recent".to_string());
    let reset = CustomMenuItem::new("reset".to_string(), "Reset".to_string());
    let quit = CustomMenuItem::new("quit".to_string(), "Quit".to_string());

    let file_submenu = Submenu::new(
        "File".to_string(),
        Menu::new()
            .add_item(open)
            .add_item(openURL)
            .add_item(open_recent)
            .add_native_item(MenuItem::Separator)
            .add_item(reset)
            .add_native_item(MenuItem::Separator)
            .add_item(quit),
    );

    let mut metadata = AboutMetadata::default();
    metadata.version = Some("1.0.0".to_string());
    metadata.authors = Some(vec![
        "Fadel".to_string(),
        "Omar Ibrahim".to_string(),
        "Abdelrahman Khalil".to_string(),
    ]);
    metadata.license = Some("MIT".to_string());
    metadata.website = Some("https://fadel.pages.dev/".to_string());
    metadata.website_label = Some("Fadel Website".to_string());

    let about = MenuItem::About("Fadel - Compare Images".into(), metadata);
    let help_submenu = Submenu::new("Help".to_string(), Menu::new().add_native_item(about));

    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_submenu(file_submenu)
        .add_submenu(help_submenu);

    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            let handle = app.handle();
            main_window.listen("front-end://store/cache/recentFilepaths", move |event| {
                handle_recently_opened_change(event.clone(), &handle);
            });
            Ok(())
        })
        .menu(menu)
        .invoke_handler(tauri::generate_handler![close_splashscreen])
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                event
                    .window()
                    .emit(
                        "menu://file/open",
                        Payload {
                            message: "Open Dialog".into(),
                        },
                    )
                    .unwrap();
            }
            "openFromURL" => {
                event
                    .window()
                    .emit(
                        "menu://file/openFromURL",
                        Payload {
                            message: "Open Dialog".into(),
                        },
                    )
                    .unwrap();
            }
            "reset" => {
                event
                    .window()
                    .emit(
                        "menu://file/reset",
                        Payload {
                            message: "Reset".into(),
                        },
                    )
                    .unwrap();
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
