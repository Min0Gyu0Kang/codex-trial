#include <windows.h>
#include <shellapi.h>
#include <string.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    char exe_path[MAX_PATH];
    char dir_path[MAX_PATH];
    char html_path[MAX_PATH];
    char *last_sep;

    (void)hInstance;
    (void)hPrevInstance;
    (void)lpCmdLine;

    if (GetModuleFileNameA(NULL, exe_path, MAX_PATH) == 0) {
        MessageBoxA(NULL, "Unable to locate executable path.", "Snake", MB_OK | MB_ICONERROR);
        return 1;
    }

    lstrcpyA(dir_path, exe_path);
    last_sep = strrchr(dir_path, '\\');
    if (last_sep == NULL) {
        MessageBoxA(NULL, "Unable to resolve executable directory.", "Snake", MB_OK | MB_ICONERROR);
        return 1;
    }
    *last_sep = '\0';

    wsprintfA(html_path, "%s\\index.html", dir_path);

    if (GetFileAttributesA(html_path) == INVALID_FILE_ATTRIBUTES) {
        MessageBoxA(NULL, "index.html not found next to Snake.exe", "Snake", MB_OK | MB_ICONERROR);
        return 1;
    }

    HINSTANCE result = ShellExecuteA(NULL, "open", html_path, NULL, dir_path, nCmdShow);
    if ((INT_PTR)result <= 32) {
        MessageBoxA(NULL, "Could not launch the game in your browser.", "Snake", MB_OK | MB_ICONERROR);
        return 1;
    }

    return 0;
}