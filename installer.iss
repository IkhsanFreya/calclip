; =====================================================================
; Skrip Kompilasi Installer Windows (Inno Setup) untuk CalClip.IN v2.0
; Standar Open Source: Ringan, Tanpa Butuh Hak Akses Administrator (UAC),
; Menghasilkan CalClip-v2.0-Setup.exe Sekali Klik.
; =====================================================================

#define MyAppName "CalClip.IN"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "CalClip Open Source"
#define MyAppURL "https://github.com/IkhsanFreya/calclip"
#define MyAppExeName "jalankan-calclip.bat"

[Setup]
; ID Unik Aplikasi
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

; Rasio Kompresi Maksimal LZMA2
Compression=lzma2/ultra64
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

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Berkas Inti Antarmuka Web Produksi
Source: "dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
; Mesin Backend & AI Script
Source: "alat\*"; DestDir: "{app}\alat"; Flags: ignoreversion recursesubdirs createallsubdirs
; Skrip Eksekusi Launcher
Source: "jalankan-calclip.bat"; DestDir: "{app}"; Flags: ignoreversion
; Ikon & Lisensi
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\dist\ikon.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\dist\ikon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall nowait skipifsilent

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
