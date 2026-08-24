use tauri::Manager;

#[cfg(target_os = "macos")]
fn configure_macos_overlay(window: &tauri::WebviewWindow) -> tauri::Result<()> {
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};

    // Tauri's generic always-on-top flag uses the floating level. A status-level
    // window stays above normal application windows while remaining below macOS
    // system alerts, the screen saver, and security UI.
    const STATUS_WINDOW_LEVEL: isize = 25;

    let ns_window_ptr = window.ns_window()? as *mut NSWindow;

    if !ns_window_ptr.is_null() {
        let ns_window = unsafe { &*ns_window_ptr };

        ns_window.setLevel(STATUS_WINDOW_LEVEL);
        ns_window.setCollectionBehavior(
            NSWindowCollectionBehavior::CanJoinAllSpaces
                | NSWindowCollectionBehavior::Stationary
                | NSWindowCollectionBehavior::IgnoresCycle
                | NSWindowCollectionBehavior::FullScreenAuxiliary
                | NSWindowCollectionBehavior::FullScreenDisallowsTiling,
        );
        ns_window.setHidesOnDeactivate(false);
        ns_window.setIgnoresMouseEvents(true);
        ns_window.setHasShadow(false);
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(window) = app.get_webview_window("overlay") {
                // Keep the desktop underneath fully interactive.
                window.set_ignore_cursor_events(true)?;
                window.set_always_on_top(true)?;

                #[cfg(target_os = "macos")]
                {
                    window.set_visible_on_all_workspaces(true)?;
                    configure_macos_overlay(&window)?;
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the EchoMem overlay");
}
