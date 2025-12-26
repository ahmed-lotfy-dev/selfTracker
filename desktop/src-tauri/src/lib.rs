// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    image::Image,
    Manager, Emitter,
};
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn toggle_overlay(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("timer-overlay") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

#[tauri::command]
fn start_drag(window: tauri::Window) {
    let _ = window.start_dragging();
}

#[tauri::command]
fn toggle_pin(window: tauri::Window, pinned: bool) {
    match window.set_always_on_top(pinned) {
        Ok(_) => println!("Successfully set always_on_top to {}", pinned),
        Err(e) => println!("Failed to set always_on_top: {}", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    let devtools = tauri_plugin_devtools::init();

    let builder = tauri::Builder::default()
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                // Hides the window instead of closing it
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
                println!("Single Instance - Args: {:?}", argv);
                // Manually check for deep link in args and emit if found
                for arg in argv {
                    if arg.starts_with("selftracker://") {
                        println!("Emitting manual deep link event: {}", arg);
                        let _ = app.emit("app-deep-link", vec![arg]);
                    }
                }

                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }))?;

            // 1. Create a Menu (optional, but good for "Quit")
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show / Hide", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;
            
            // 2. Build the Tray Icon
            println!("Loading tray icon...");
            let tray_icon = Image::from_bytes(include_bytes!("../icons/32x32.png")).expect("failed to load tray icon");

            let _tray = TrayIconBuilder::new()
                .icon(tray_icon) // Use explicit 32x32 icon
                .menu(&menu)
                .show_menu_on_left_click(true) // Changed to true to behave more like standard apps if menu is desired on left click, or control strictly via events
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                             if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    match event {
                         TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                         _ => {}
                    }
                })
                .build(app);

            match _tray {
                Ok(_) => println!("System tray built successfully!"),
                Err(e) => println!("Error building system tray: {}", e),
            }

            #[cfg(any(windows, target_os = "linux"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register("selftracker")?;
            }

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![greet, toggle_overlay, start_drag, toggle_pin]);

    #[cfg(debug_assertions)]
    let builder = {
        builder.plugin(devtools)
    };

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}