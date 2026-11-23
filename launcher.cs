using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;

[assembly: AssemblyTitle("CalClip.IN")]
[assembly: AssemblyDescription("CalClip.IN Desktop Video Clipper & Motion AI Launcher")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("CalClip Open Source")]
[assembly: AssemblyProduct("CalClip.IN")]
[assembly: AssemblyCopyright("Copyright © 2026 CalClip Open Source")]
[assembly: AssemblyTrademark("CalClip.IN")]
[assembly: AssemblyCulture("")]
[assembly: ComVisible(false)]
[assembly: AssemblyVersion("2.1.0.0")]
[assembly: AssemblyFileVersion("2.1.0.0")]

namespace CalClipLauncher
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string studioScript = Path.Combine(appDir, "alat", "studio", "studio.py");

            // 1. Prioritas runtime Python mandiri terbundel
            string pythonExe = Path.Combine(appDir, "python", "pythonw.exe");
            if (!File.Exists(pythonExe))
            {
                pythonExe = Path.Combine(appDir, "python", "python.exe");
            }

            string uvExe = Path.Combine(appDir, "bin", "uv.exe");

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.WorkingDirectory = Path.Combine(appDir, "alat", "studio");
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.WindowStyle = ProcessWindowStyle.Hidden;

            // Set environment variabel untuk data mandiri dan runtime terbundel
            string calclipData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "CalClip");
            psi.EnvironmentVariables["STUDIO_DATA"] = calclipData;

            string bundledPy = Path.Combine(appDir, "python", "python.exe");
            if (File.Exists(bundledPy))
            {
                psi.EnvironmentVariables["STUDIO_PY"] = bundledPy;
            }
            if (File.Exists(uvExe))
            {
                psi.EnvironmentVariables["STUDIO_UV"] = uvExe;
            }

            if (File.Exists(pythonExe))
            {
                psi.FileName = pythonExe;
                psi.Arguments = "\"" + studioScript + "\"";
            }
            else if (File.Exists(uvExe))
            {
                psi.FileName = uvExe;
                psi.Arguments = "run \"" + studioScript + "\"";
            }
            else
            {
                // Fallback pencarian python di sistem pengguna
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string[] candidates = new string[]
                {
                    Path.Combine(localApp, "Programs", "Studio Maliki", "python", "pythonw.exe"),
                    Path.Combine(localApp, "Programs", "Studio Maliki", "python", "python.exe"),
                    Path.Combine(localApp, "Programs", "Python", "Python312", "pythonw.exe"),
                    Path.Combine(localApp, "Programs", "Python", "Python312", "python.exe"),
                    Path.Combine(localApp, "Programs", "Python", "Python313", "pythonw.exe"),
                    Path.Combine(localApp, "Programs", "Python", "Python311", "pythonw.exe")
                };

                foreach (string c in candidates)
                {
                    if (File.Exists(c))
                    {
                        pythonExe = c;
                        break;
                    }
                }

                if (!File.Exists(pythonExe))
                {
                    pythonExe = "pythonw.exe";
                }

                psi.FileName = pythonExe;
                psi.Arguments = "\"" + studioScript + "\"";
            }

            try
            {
                Process proc = Process.Start(psi);
                if (proc != null)
                {
                    // Beri waktu 2 detik untuk memeriksa apakah langsung crash saat startup
                    if (proc.WaitForExit(2000) && proc.ExitCode != 0)
                    {
                        string crashLog = Path.Combine(calclipData, "crash.log");
                        string detail = File.Exists(crashLog) ? File.ReadAllText(crashLog) : "Kode keluar: " + proc.ExitCode;
                        MessageBox.Show(
                            "CalClip.IN gagal dijalankan:\n\n" + detail,
                            "CalClip.IN Error",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Error
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Gagal menjalankan CalClip.IN:\n" + ex.Message,
                    "CalClip.IN Launcher",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
