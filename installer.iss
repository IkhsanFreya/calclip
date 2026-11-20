; =====================================================================
; Skrip Kompilasi Installer Windows (Inno Setup) untuk CalClip.IN v2.0
; Bundel Mandiri 100% Lengkap (Python Runtime, AI Engine, & WebView2 GUI)
; Bebas Izin Administrator (UAC), Ikon Resmi CC.in, Sekali Klik Siap Pakai.
; =====================================================================

#define MyAppName "CalClip.IN"
#define MyAppVersion "2.1.0"
#define MyAppPublisher "CalClip Open Source"
#define MyAppURL "https://github.com/IkhsanFreya/calclip"
#define MyAppExeName "CalClip.exe"

[Setup]
; ID Unik Aplikasi CalClip.IN
AppId={{D37F8E12-4A9B-4C82-95E1-71EFA891C021}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Lokasi Instalasi Otomatis di Akun Pengguna (Bebas Izin Administrator)
DefaultDirName={localappdata}\Programs\CalClip.IN
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
DisableDirPage=yes
LicenseFile=alat\LISENSI.md

; Lokasi File Installer Hasil Kompilasi
OutputDir=hasil-installer
OutputBaseFilename=CalClip-v2.1-Windows-Setup
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
Name: "indonesian"; MessagesFile: "compiler:Default.isl"; LicenseFile: "alat\LISENSI.md"

[Messages]
SetupAppTitle=Instalasi
SetupWindowTitle=Instalasi - %1
ButtonNext=&Maju
ButtonInstall=&Pasang
ButtonCancel=Batal
ButtonBack=&Kembali
ButtonFinish=&Selesai
ButtonYes=&Ya
ButtonNo=&Tidak

; *** Halaman Kesepakatan Lisensi (Gambar 2)
WizardLicense=Kesepakatan Lisensi
LicenseLabel=Silakan baca informasi berikut sebelum meneruskan.
LicenseLabel3=Silakan baca Kesepakatan Lisensi berikut. Anda harus setuju dengan syarat dari kesepakatan ini sebelum meneruskan instalasi.
LicenseAccepted=Saya &setujui kesepakatan ini
LicenseNotAccepted=Saya &tidak setuju kesepakatan ini

; *** Halaman Pilih Tugas Tambahan (Gambar 3)
WizardSelectTasks=Pilih Tugas Tambahan
SelectTasksDesc=Tugas tambahan mana sajakah yang sebaiknya dijalankan?
SelectTasksLabel2=Pilih tugas tambahan yang Anda ingin kami jalankan ketika memasang [name], lalu klik Maju.

; *** Halaman Siap Memasang (Gambar 4)
WizardReady=Siap Memasang
ReadyLabel1=Kami siap untuk memulai instalasi [name] pada komputer Anda.
ReadyLabel2a=Klik Pasang untuk meneruskan instalasi, atau klik Kembali bila Anda ingin menilik atau mengubah setelan.
ReadyMemoTasks=Tugas tambahan:

; *** Dialog Konfirmasi Keluar Pemandu (Gambar 5)
ExitSetupTitle=Keluar Pemandu
ExitSetupMessage=Instalasi tidak lengkap. Bila Anda keluar sekarang, program takkan terpasang.%n%nAnda bisa menjalankan Pemandu lagi lain kali untuk melengkapinya.%n%nKeluar?

; *** Halaman Selesai
ClickFinish=Klik Selesai untuk keluar dari Instalasi.
FinishedHeadingLabel=Menyelesaikan Pemandu Instalasi [name]
FinishedLabel=Instalasi telah selesai memasang [name] pada komputer Anda. Aplikasi dapat dijalankan dengan memilih pintasan yang terpasang.

; *** Copot Pemasangan (Uninstaller)
UninstallAppTitle=Copot Pemasangan
UninstallAppFullTitle=Copot Pemasangan - %1
ConfirmUninstall=Apakah Anda yakin ingin menghapus %1 beserta seluruh komponennya?
UninstalledAll=%1 telah berhasil dihapus dari komputer Anda.
UninstalledMost=Penghapusan %1 telah selesai.

[CustomMessages]
indonesian.CreateDesktopIcon=Buat pintasan di Desktop
indonesian.AdditionalIcons=Pintasan:

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Icons]
Name: "{userprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\dist\ikon.ico"
Name: "{userdesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\dist\ikon.ico"; Tasks: desktopicon
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
Filename: "{app}\{#MyAppExeName}"; Description: "Jalankan {#MyAppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Bersihkan seluruh direktori instalasi aplikasi agar tidak ada berkas tersisa
Type: filesandordirs; Name: "{app}"

[Code]
// Konfirmasi apakah pengguna ingin menyimpan data video riwayat di folder CalClip
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  DataDir: string;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    DataDir := ExpandConstant('{%USERPROFILE}\CalClip');
    if (DataDir <> '') and DirExists(DataDir) then
    begin
      if MsgBox('Apakah Anda juga ingin menghapus folder data video dan pengaturan di ' + DataDir + '?', mbConfirmation, MB_YESNO) = IDYES then
      begin
        DelTree(DataDir, True, True, True);
      end;
    end;
  end;
end;
