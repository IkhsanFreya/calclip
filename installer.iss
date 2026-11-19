; =====================================================================
; Skrip Kompilasi Installer Windows (Inno Setup) untuk CalClip.IN v2.0
; Bundel Mandiri 100% Lengkap (Python Runtime, AI Engine, & WebView2 GUI)
; Bebas Izin Administrator (UAC), Ikon Resmi CC.in, Sekali Klik Siap Pakai.
; =====================================================================

#define MyAppName "CalClip.IN"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "CalClip Open Source"
#define MyAppURL "https://github.com/IkhsanFreya/calclip"
#define MyAppExeName "CalClip.exe"

[Setup]
; ID Unik Aplikasi CalClip.IN
AppId={{D37F8E12-4A9B-4C82-95E1-71EFA891C021}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Lokasi Instalasi Otomatis di Akun Pengguna (Bebas Izin Administrator)
DefaultDirName={localappdata}\Programs\CalClip.IN
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Lokasi File Installer Hasil Kompilasi
OutputDir=hasil-installer
OutputBaseFilename=CalClip-v2.0-Windows-Setup
SetupIconFile=dist\ikon.ico
UninstallDisplayIcon={app}\dist\ikon.ico
ChangesAssociations=yes

; Kompresi Maksimal LZMA2 untuk Ukuran ~130-140 MB Mandiri Lengkap
Compression=lzma2/normal
SolidCompression=yes

; Gaya Jendela Wizard Modern
WizardStyle=modern

; Arsitektur 64-bit Windows 10/11
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Icons]
Name: "{userprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\dist\ikon.ico"
Name: "{userdesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\dist\ikon.ico"
[Files]
; Launcher Utama Native & Cadangan
Source: "CalClip.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "jalankan-calclip.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion

; Berkas Inti Antarmuka Web Produksi
Source: "dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs

; Mesin Backend & AI Script
Source: "alat\*"; DestDir: "{app}\alat"; Flags: ignoreversion recursesubdirs createallsubdirs

; Python Runtime Mandiri Lengkap (PyWebView, PyTorch/ONNX, Faster-Whisper, FFmpeg)
Source: "C:\Users\Asus ROG\AppData\Local\Programs\Studio Maliki\python\*"; DestDir: "{app}\python"; Flags: ignoreversion recursesubdirs createallsubdirs

; Binari Utilitas Eksekusi Mandiri (uv.exe)
Source: "C:\Users\Asus ROG\AppData\Local\Programs\Studio Maliki\bin\*"; DestDir: "{app}\bin"; Flags: ignoreversion recursesubdirs createallsubdirs


[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Bersihkan file temporary build saat uninstall
Type: filesandordirs; Name: "{app}\dist"
Type: filesandordirs; Name: "{app}\alat\__pycache__"

[Code]
// Konfirmasi apakah pengguna ingin menyimpan data video riwayat di folder CalClip
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  DataDir: string;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    DataDir := ExpandConstant('{userprofile}\CalClip');
    if DirExists(DataDir) then
    begin
      if MsgBox('Apakah Anda juga ingin menghapus folder data video dan pengaturan di ' + DataDir + '?', mbConfirmation, MB_YESNO) = IDYES then
      begin
        DelTree(DataDir, True, True, True);
      end;
    end;
  end;
end;
